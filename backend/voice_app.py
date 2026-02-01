#!/usr/bin/env python3
"""
Voice-only interface for the backend
"""
from app import process_query
from tts import speak_text
from asr import start_listening_thread
import time

def main():
    driver_id = input("Enter Driver ID: ")
    session_id = driver_id
    
    print("🎤 Voice Assistant Starting...")
    print("Say something to begin (or say 'exit' to quit)")
    
    # Welcome message
    welcome = "Hello! I'm your voice assistant. How can I help you today?"
    print(f"Assistant: {welcome}")
    speak_text(welcome)
    
    def handle_speech(text):
        """Process speech input and respond with voice"""
        if "exit" in text.lower():
            goodbye = "Goodbye! Have a great day!"
            print(f"Assistant: {goodbye}")
            speak_text(goodbye)
            return
        
        print(f"You: {text}")
        
        # Process query and get response
        response, should_end = process_query(driver_id, text, session_id)
        print(f"Assistant: {response}")
        speak_text(response)
        
        if should_end:
            return
    
    # Start voice recognition
    thread, interrupt_event = start_listening_thread(callback=handle_speech)
    
    try:
        print("🎧 Listening... (Press Ctrl+C to stop)")
        while thread.is_alive():
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping voice assistant...")
        interrupt_event.set()
        thread.join(timeout=2)
        print("Voice assistant stopped.")

if __name__ == "__main__":
    main()