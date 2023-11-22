from flask import Flask, send_from_directory, request, make_response, jsonify
import subprocess
import os
import sys
import shutil
import random
import base64
import openai
from openai import OpenAI

client = OpenAI()





app = Flask(__name__)


@app.route('/<path:path>')
def serve_dialoge(path):
    return send_from_directory('.', path)

# favicon.ico 파일 서비스


@app.route('/favicon.ico')
def serve_favicon():
    return send_from_directory('.', 'favicon.ico')

def mp3_to_txt(filename):
    global client
    audio_file = open(filename, "rb")
    transcript = client.audio.transcriptions.create(model="whisper-1", file=audio_file)
    audio_file.close()
    return transcript.text


@app.route('/api/mp3-store.api', methods=['POST'])
def mp3_store():
    blob_base64 = request.json['blob_base64']
    binary_data = base64.b64decode(blob_base64)
    filename = "./tmp/"+"abc.mp3"
    f = open(filename,"wb")
    f.write(binary_data)
    f.close()

    transcript = mp3_to_txt(filename)

    # TODO: The 'openai.api_key_path' option isn't read in the client API. You will need to pass it when you instantiate the client, e.g. 'OpenAI(api_key_path='./key.txt')'
    # openai.api_key_path = './key.txt'
    # audio_file= open(filename, "rb")
    # transcript = client.audio.transcribe("whisper-1", audio_file)
    # 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
    result = {'resp': 'OK', 'message': 'mp3 sucessfully stored', 'filename':filename, 'transcript': transcript}
    resp = make_response(jsonify(result))
    return resp


app.run(debug=True, host='localhost', port=5011)
