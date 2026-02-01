# backend/utils/constants.py

# -------------------------
# INTENT LABELS
# -------------------------
INTENT_SWAP_HISTORY = "swap_history"
INTENT_NEAREST_STATION = "nearest_station"
INTENT_SUBSCRIPTION_STATUS = "subscription_status"
INTENT_LEAVE_INFO = "leave_information"
INTENT_OPEN_TALK = "open_talk"
INTENT_FALLBACK = "fallback"

SUPPORTED_INTENTS = [
    INTENT_SWAP_HISTORY,
    INTENT_NEAREST_STATION,
    INTENT_SUBSCRIPTION_STATUS,
    INTENT_LEAVE_INFO,
    INTENT_OPEN_TALK,
]


# -------------------------
# FSM STATES
# -------------------------
STATE_START = "start"
STATE_INTENT_IDENTIFIED = "intent_identified"
STATE_PROCESSING = "processing"
STATE_RESOLVED = "resolved"
STATE_OPEN_TALK = "open_talk"
STATE_FALLBACK = "fallback"
STATE_HANDOFF = "handoff"
STATE_END = "end"


# -------------------------
# SENTIMENT & CONFIDENCE
# -------------------------
NEGATIVE_SENTIMENT_THRESHOLD = -0.6
CONFIDENCE_HANDOFF_THRESHOLD = 0.3

MAX_FALLBACK_COUNT = 3
MAX_TURNS_PER_SESSION = 20


# -------------------------
# LANGUAGE SETTINGS
# -------------------------
DEFAULT_LANGUAGE = "hi-en"   # Hindi + English code-mix
SUPPORTED_LANGUAGES = ["hi", "en", "hi-en"]


# -------------------------
# SYSTEM MESSAGES
# -------------------------
HANDOFF_MESSAGE = (
    "I am transferring this call to a human agent to help you better."
)

FALLBACK_MESSAGE = (
    "Sorry, I didn’t understand that. Could you please repeat?"
)

# backend/utils/logger.py

import logging
import sys
from logging.handlers import RotatingFileHandler


def get_logger(name: str) -> logging.Logger:
    """
    Returns a configured logger instance.
    Same format across the entire backend.
    """

    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    if logger.handlers:
        return logger  # Prevent duplicate handlers

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s"
    )
    console_handler.setFormatter(console_formatter)

    # File handler (rotating)
    file_handler = RotatingFileHandler(
        "data/logs/backend.log",
        maxBytes=5_000_000,
        backupCount=3
    )
    file_formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    )
    file_handler.setFormatter(file_formatter)

    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return logger
