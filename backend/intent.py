import re
from typing import Tuple, Optional

# Intent keywords for matching
INTENT_KEYWORDS = {
    "swap": {
        "keywords": [
            "swap", "invoice", "history", "cost", "charges", "payment", 
            "battery swap", "swap history", "total swaps", "payable"
        ],
        "aliases": ["billing", "charges", "transaction"]
    },
    "nearest_station": {
        "keywords": [
            "nearest", "station", "dsk", "location", "where", "distance",
            "battery station", "charging station", "closest"
        ],
        "aliases": ["location", "place", "nearby"]
    },
    "subscription": {
        "keywords": [
            "subscription", "plan", "pricing", "renewal", "validity", "period",
            "subscribe", "plan details", "price", "cost per swap"
        ],
        "aliases": ["membership", "package", "rate"]
    },
    "leave": {
        "keywords": [
            "leave", "activation", "dsk", "penalty", "leave status", "leave info",
            "on leave", "deactivate", "reactivate"
        ],
        "aliases": ["inactive", "deactivated", "off"]
    }
}


def calculate_intent_confidence(user_query: str, intent: str) -> float:
    """
    Calculate confidence score for a detected intent (0.0 to 1.0)
    
    Args:
        user_query: The user's input query
        intent: The detected intent type
        
    Returns:
        Confidence score between 0.0 and 1.0
    """
    query_lower = user_query.lower()
    intent_data = INTENT_KEYWORDS[intent]
    
    # Count keyword matches
    keyword_matches = sum(1 for kw in intent_data["keywords"] if kw in query_lower)
    alias_matches = sum(1 for alias in intent_data["aliases"] if alias in query_lower)
    
    # Calculate base confidence
    total_keywords = len(intent_data["keywords"])
    confidence = (keyword_matches + alias_matches * 0.7) / total_keywords
    
    return min(confidence, 1.0)


def detect_intent(user_query: str) -> Tuple[Optional[str], float]:
    """
    Detect user intent from query and return intent with confidence score.
    
    Args:
        user_query: The user's input query
        
    Returns:
        Tuple of (intent, confidence_score)
        intent can be: 'swap', 'nearest_station', 'subscription', 'leave', or None
        confidence_score ranges from 0.0 to 1.0
    """
    if not user_query or not user_query.strip():
        return None, 0.0
    
    # Calculate confidence for each intent
    intent_scores = {}
    for intent in INTENT_KEYWORDS.keys():
        confidence = calculate_intent_confidence(user_query, intent)
        intent_scores[intent] = confidence
    
    # Get the highest scoring intent
    best_intent = max(intent_scores, key=intent_scores.get)
    best_confidence = intent_scores[best_intent]
    
    return best_intent, best_confidence


def handle_intent_result(intent: Optional[str], confidence: float) -> str:
    """
    Handle the intent detection result.
    If confidence is below threshold, return appropriate message.
    
    Args:
        intent: Detected intent or None
        confidence: Confidence score (0.0-1.0)
        
    Returns:
        Intent to use, or message to ask user to clarify
    """
    CONFIDENCE_THRESHOLD = 0.45
    
    if intent is None or confidence < CONFIDENCE_THRESHOLD:
        return (
            "I didn't quite understand your query. Could you please rephrase or choose from:\n"
            "1. Swap history & Invoice explanation\n"
            "2. Nearest Battery Smart Station\n"
            "3. Subscription & Pricing details\n"
            "4. Leave information & Activation DSK\n\n"
            "Or would you like me to handoff to an agent?"
        )
    
    return intent


def process_user_input(user_query: str) -> Tuple[Optional[str], float]:
    """
    Main function to process user input and return intent with confidence.
    
    Args:
        user_query: The user's input query
        
    Returns:
        Tuple of (intent, confidence_score)
    """
    intent, confidence = detect_intent(user_query)
    
    print(f"\n[DEBUG] Detected Intent: {intent}")
    print(f"[DEBUG] Confidence Score: {confidence:.2f}\n")
    
    return intent, confidence


# Example usage
if __name__ == "__main__":
    test_queries = [
        "What's my swap invoice?",
        "Where is the nearest charging station?",
        "Tell me about my subscription plan",
        "What's my leave status?",
        "Hello world",  # Low confidence example
        "xyz abc"  # Very low confidence example
    ]
    
    for query in test_queries:
        intent, confidence = process_user_input(query)
        result = handle_intent_result(intent, confidence)
        
        if confidence >= 0.45:
            print(f"Query: '{query}'")
            print(f"Intent: {intent} (Confidence: {confidence:.2f})")
        else:
            print(f"Query: '{query}'")
            print(f"Result: {result}")
        print("-" * 50)
