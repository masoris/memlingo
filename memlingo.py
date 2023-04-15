from flask import Flask, send_from_directory, render_template, request, make_response, jsonify
import subprocess, os

app = Flask(__name__)

# PAGES 파일 서비스
@app.route('/pages/<path:path>')
def serve_pages(path):
	return send_from_directory('pages', path)

@app.route('/tts/<path:path>')
def serve_tts(path):
	return send_from_directory('../tts', path)

@app.route('/api/login.api', methods=['POST', 'GET'])
def login():
	# if request.method == 'GET':
	# 	email1 = request.args['email1']
	# 	email2 = request.args['email2']
	# else:
	# 	email1 = request.form['email1']
	# 	email2 = request.form['email2']

	email1 = request.json['email1']
	email2 = request.json['email2']
	if email1 == email2:
		result = {'resp': 'OK', 'user': email1}
		resp = make_response(jsonify(result))
		resp.set_cookie('login_status', 'success')
		return resp
	else:
		result = {'resp': 'Fail', 'user': ''}
		resp = make_response(jsonify(result))
		resp.set_cookie('login_status', 'fail')
		return resp

@app.route('/api/logout.api', methods=['POST'])
def logout():
	result = {'resp': 'OK', 'user': ''}
	resp = make_response(jsonify(result))
	resp.set_cookie('login_status', 'loged_out')
	return resp

@app.route('/tts/speak.api', methods=['POST'])
def speak():
	lang = request.json['lang']
	voicename = request.json['voicename']
	textdata = request.json['textdata']

	old_dir = os.curdir
	os.chdir("../tts")
	if lang == "eo":
		cmd = ["python3", "esp_polish_transcription.py", "-e" ,"%s" % textdata, "%s" % voicename]
	else:
		cmd = ["python3", "esp_polish_transcription.py", "-p" ,"%s" % textdata, "%s" % voicename]
	# print(cmd)
	output = subprocess.run(cmd, stdout=subprocess.PIPE) 
	os.chdir(old_dir)
	# print(output.stdout.decode('utf-8'))

	lines = output.stdout.decode('utf-8').split('\n')
	print (lines)
	for line in lines:
		if line.find("pol_txt=") == 0:
			pol_txt = line[8:]
		if line.find("esp_txt=") == 0:
			esp_txt = line[8:]
	result = {'resp': 'OK', 'lang':lang, 'voicename':voicename, 'textdata':textdata, 'pol_txt':pol_txt}
	resp = make_response(jsonify(result))
	return resp

@app.route('/tts/remember.api', methods=['POST'])
def remember():
	eo_txt = request.json['eo_txt']
	pl_txt = request.json['pl_txt']
	voice_name = request.json['voice_name']

	old_dir = os.curdir
	os.chdir("../tts")
	
	cmd = ["python3", "remember.py","%s" % eo_txt, "%s" % pl_txt, "%s" % voice_name]
	
	output = subprocess.run(cmd, stdout=subprocess.PIPE) 
	os.chdir(old_dir)
	print(output.stdout.decode('utf-8'))
	result = {'resp': 'OK'}
	resp = make_response(jsonify(result))
	return resp
				
app.run(debug=True, host='192.168.117.129', port=5000)


