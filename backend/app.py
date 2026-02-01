from sentence_transformers import SentenceTransformer, util
from swap import get_swap_invoice_summary
from near import get_nearest_station
from subs import get_subscription_details
from leave import get_leave_and_activation_info
from groq import Groq
from prompts import SYSTEM_PROMPT, OPEN_TALK_PROMPT, REFINE_PROMPT
from tts import speak_text
from asr import start_listening_thread
import os
import threading
import time
from dotenv import load_dotenv
load_dotenv()

# Initialize classifier once globally
INTENT_EXAMPLES = {
    "swap_history": ["swap history", "battery swaps"],
    "nearest_station": ["nearest station", "find station"],
    "subscription_status": ["subscription status", "plan status"],
    "leave_info": ["leave policy", "vacation days"],
    "open_talk": ["hello", "hi", "how are you", "good morning"],
    "handoff": ["agent", "human", "transfer", "escalate"],
    "end_chat": ["bye", "goodbye", "end", "close", "finish"]
}

class IntentClassifier:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.embeddings = {intent: self.model.encode(examples) for intent, examples in INTENT_EXAMPLES.items()}

    def classify(self, text):
        query_emb = self.model.encode(text)
        best_intent, best_score = None, 0
        
        for intent, emb in self.embeddings.items():
            score = util.cos_sim(query_emb, emb).max().item()
            if score > best_score:
                best_intent, best_score = intent, score
        
        return {"intent": best_intent if best_score > 0.5 else "open_talk", "confidence": best_score}

# Global classifier instance
classifier = IntentClassifier()

class ConversationMemory:
    def __init__(self):
        self.sessions = {}
        self.sentiment_scores = {}
    
    def add_message(self, session_id, role, content):
        if session_id not in self.sessions:
            self.sessions[session_id] = []
        self.sessions[session_id].append({"role": role, "content": content})
        if len(self.sessions[session_id]) > 10:
            self.sessions[session_id] = self.sessions[session_id][-10:]
    
    def get_context(self, session_id):
        return self.sessions.get(session_id, [])
    
    def update_sentiment(self, session_id, score):
        if session_id not in self.sentiment_scores:
            self.sentiment_scores[session_id] = []
        self.sentiment_scores[session_id].append(score)
        if len(self.sentiment_scores[session_id]) > 5:
            self.sentiment_scores[session_id] = self.sentiment_scores[session_id][-5:]
    
    def get_avg_sentiment(self, session_id):
        scores = self.sentiment_scores.get(session_id, [0])
        return sum(scores) / len(scores)

memory = ConversationMemory()

def analyze_sentiment(text):
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": f"Rate sentiment of: '{text}' on scale -1 (negative) to 1 (positive). Reply only with number."}],
        model="llama-3.3-70b-versatile",
        max_tokens=5
    )
    try:
        return float(response.choices[0].message.content.strip())
    except:
        return 0

def generate_handoff_summary(session_id, driver_id):
    context = memory.get_context(session_id)
    summary = f"HANDOFF SUMMARY\nDriver ID: {driver_id}\nIssue: User needs human assistance\nConversation: "
    for msg in context[-3:]:
        summary += f"{msg['role']}: {msg['content'][:50]}... "
    return summary

def refine_with_groq(text, is_open_talk=False, original_query="", session_id="default"):
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(memory.get_context(session_id))
    
    if is_open_talk:
        prompt = OPEN_TALK_PROMPT.format(query=original_query)
    else:
        prompt = f"User asked: {original_query}\n\nData: {text}\n\nMake this conversational in 1-2 lines with Hindi-English mix."
    
    messages.append({"role": "user", "content": prompt})
    
    response = client.chat.completions.create(
        messages=messages,
        model="llama-3.3-70b-versatile",
        max_tokens=50
    )
    
    bot_response = response.choices[0].message.content
    memory.add_message(session_id, "user", original_query)
    memory.add_message(session_id, "assistant", bot_response)
    
    return bot_response

def process_query(driver_id, query, session_id="default"):
    # Analyze sentiment
    sentiment = analyze_sentiment(query)
    memory.update_sentiment(session_id, sentiment)
    avg_sentiment = memory.get_avg_sentiment(session_id)
    
    result = classifier.classify(query)
    intent = result["intent"]
    
    # Check handoff conditions
    if intent == "handoff" or avg_sentiment < -0.6:
        summary = generate_handoff_summary(session_id, driver_id)
        print("\n" + summary)
        return "Aapko human agent se connect kar raha hun. Please wait...", True
    
    # Check end chat
    if intent == "end_chat":
        return "Dhanyawad! Aapka din shubh ho. Goodbye!", True
    
    if intent == "open_talk":
        response = refine_with_groq("", is_open_talk=True, original_query=query, session_id=session_id)
    elif intent == "swap_history":
        raw_response = get_swap_invoice_summary(driver_id)
        response = refine_with_groq(raw_response, original_query=query, session_id=session_id)
    elif intent == "nearest_station":
        raw_response = get_nearest_station(driver_id)
        response = refine_with_groq(raw_response, original_query=query, session_id=session_id)
    elif intent == "subscription_status":
        raw_response = get_subscription_details(driver_id)
        response = refine_with_groq(raw_response, original_query=query, session_id=session_id)
    elif intent == "leave_info":
        raw_response = get_leave_and_activation_info(driver_id)
        response = refine_with_groq(raw_response, original_query=query, session_id=session_id)
    else:
        response = refine_with_groq("Sorry, I didn't understand. I can help with swap history, nearest stations, subscription status, or leave info.", original_query=query, session_id=session_id)
    
    return response, False

if __name__ == "__main__":
    driver_id = input("Driver ID: ")
    session_id = driver_id
    
    # Ask user for interaction mode
    mode = input("Choose mode - (1) Text chat (2) Voice chat: ").strip()
    
    if mode == "2":
        print(f"🎤 Voice chat started for Driver ID: {driver_id}")
        print("Say something to start... (Say 'exit' to quit)")
        
        def handle_voice_input(text):
            if "exit" in text.lower():
                interrupt_event.set()
                return
            print(f"You: {text}")
            response, should_end = process_query(driver_id, text, session_id)
            print(f"Assistant: {response}")
            speak_text(response)
            if should_end:
                interrupt_event.set()
        
        thread, interrupt_event = start_listening_thread(callback=handle_voice_input)
        
        try:
            while thread.is_alive():
                time.sleep(0.1)
        except KeyboardInterrupt:
            interrupt_event.set()
    else:
        # Text chat with voice responses
        while True:
            query = input("Query (or 'quit'): ")
            if query.lower() == 'quit':
                break
            
            response, should_end = process_query(driver_id, query, session_id)
            print(response)
            speak_text(response)
            
            if should_end:
                break