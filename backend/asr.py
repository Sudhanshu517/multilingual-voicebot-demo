import speech_recognition as sr
import threading
import time

def continuous_transcription(callback=None, interrupt_event=None):
    recognizer = sr.Recognizer()
    
    # Adjust for balanced response
    recognizer.pause_threshold = 1.0
    recognizer.energy_threshold = 300
    recognizer.dynamic_energy_threshold = True

    with sr.Microphone() as source:
        print(">>> Initializing... Adjusting for background noise.")
        recognizer.adjust_for_ambient_noise(source, duration=1)
        print(">>> Online. (Say 'exit' to stop the program)")

        while True:
            # Check for interrupt signal
            if interrupt_event and interrupt_event.is_set():
                print("Interrupted by external signal.")
                break
                
            try:
                print("\nListening...")
                # Longer timeout for better speech capture
                audio = recognizer.listen(source, timeout=2, phrase_time_limit=8)
                
                print("Processing...")
                text = recognizer.recognize_google(audio).lower()
                
                print(f"You said: {text}")
                
                # Call callback function if provided
                if callback:
                    callback(text)

                # Check for the exit command
                if "exit" in text:
                    print("Exiting program... Goodbye!")
                    break

            except sr.WaitTimeoutError:
                # Timeout - continue listening
                continue
            except sr.UnknownValueError:
                # This happens if you don't speak or it's just noise
                print("... (No speech detected) ...")
                continue
            except sr.RequestError:
                print("Network error. Please check your internet connection.")
                break
            except KeyboardInterrupt:
                print("\nManual exit detected.")
                break

def start_listening_thread(callback=None):
    """Start ASR in a separate thread with interrupt capability"""
    interrupt_event = threading.Event()
    
    def asr_thread():
        continuous_transcription(callback, interrupt_event)
    
    thread = threading.Thread(target=asr_thread, daemon=True)
    thread.start()
    
    return thread, interrupt_event

if __name__ == "__main__":
    continuous_transcription()