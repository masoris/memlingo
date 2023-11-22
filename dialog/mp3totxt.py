import openai
from openai import OpenAI

# client = OpenAI(api_key_path='./key.txt')
client = OpenAI()
# TODO: The 'openai.api_key_path' option isn't read in the client API. You will need to pass it when you instantiate the client, e.g. 'OpenAI(api_key_path='./key.txt')'
# openai.api_key_path = './key.txt'


def mp3_to_txt(filename):
    global client
    audio_file = open(filename, "rb")
    transcript = client.audio.transcriptions.create(model="whisper-1", file=audio_file)
    audio_file.close()
    return transcript.text

# audio_file= open("/path/to/file/audio.mp3", "rb")
# transcript = client.audio.transcriptions.create(
#   model="whisper-1", 
#   file=audio_file
# )

print(mp3_to_txt("./tmp/abc.mp3"))