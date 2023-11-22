from pathlib import Path
from openai import OpenAI
# import httpcore
# setattr(httpcore, 'SyncHTTPTransport', Any)

client = OpenAI()

speech_file_path = Path(__file__).parent / "speech.mp3"
response = client.audio.speech.create(
  model="tts-1",
  voice="alloy",
  input="Saluton. Mi estas studento. Chu vi shatas alkolajhon? Amikeco kaj lingvacho."
)

response.stream_to_file(speech_file_path)


# from openai import OpenAI
# import openai

# client = openai.OpenAI()
# openai.api_key_path = './key.txt'

# response = client.audio.speech.create(
#     model="tts-1",
#     voice="alloy",
#     input="Saluton. Mi estas studento. Ĉu vi ŝatas alkolaĵon? Amikeco kaj lingvaĉo.",
# )

# response.stream_to_file("output.mp3")