from flask import Flask, send_from_directory, render_template, request, make_response, jsonify

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


	        # jsondata = {lang: field, voicename: voice, textdata: text};

	result = {'resp': 'OK', 'lang':lang, 'voicename':voicename, 'textdata':textdata}
	resp = make_response(jsonify(result))
	return resp
		
app.run(debug=True, host='192.168.117.129', port=5000)


