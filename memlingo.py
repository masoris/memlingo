from flask import Flask, send_from_directory, render_template, request, make_response, jsonify
import subprocess, os, re, json

app = Flask(__name__)

# PAGES 파일 서비스
@app.route('/pages/<path:path>')
def serve_pages(path):
	return send_from_directory('pages', path)

@app.route('/tts/<path:path>')
def serve_tts(path):
	return send_from_directory('../tts', path)

def is_valid_email(email):
    # 이메일 주소에 대한 정규 표현식
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def create_user(email):
    # 디렉토리 생성
    user_dir = os.path.join("./users", email[0], email)
    if not os.path.exists(user_dir):
        os.makedirs(user_dir)

    # userinfo.json 파일 생성
    user_info = {
        "userid": "",
        "email": email,
        "last_login": "",
        "admin_flag": ""
    }
    user_info_file = os.path.join(user_dir, "userinfo.json")
    with open(user_info_file, "w") as f:
        json.dump(user_info, f)

#  /api/login.api
#           input: email1, email2, lang
#output: userid, email, cookie:login_status, lang, courses{제목, 짧은 설명, 긴 설명, Points, Progress, Total_count, Needs_Review, Not_Seen, Familiar, Mastered}
@app.route('/api/login.api', methods=['POST', 'GET'])
def login():
	if request.method == 'GET':
		email1 = request.args['email1']
		email2 = request.args['email2']
		lang = request.args['lang']
	else:
		email1 = request.form['email1']
		email2 = request.form['email2']
		lang = request.args['lang']

	email1 = request.json['email1']
	email2 = request.json['email2']
	lang = request.json['lang']

	#이메일 검증과 lang 검증을 하고,
	if email1 != email2 or not is_valid_email(email1):
		result = {'resp': 'Fail', 'message': 'email is invalid or email1 is not same to email2'}
		resp = make_response(jsonify(result))
		resp.set_cookie('login_status', 'fail')
		return resp
	if lang not in ['ko', 'jp','cn-zh', 'cn-tw']:
		result = {'resp': 'Fail', 'message': 'language is not supported'}
		resp = make_response(jsonify(result))
		resp.set_cookie('login_status', 'fail')
		return resp	
	
	#처음에 들어온 이메일 이면 해당 사용자의 홈 디렉토리를 만들고, 해당 폴더를 초기화 시켜준다.
	user_dir = os.path.join("./users", email1[0], email1)
	if not os.path.exists(user_dir):
		create_user(email1)

	#./courses 폴더에 가면 lang 폴더 밑에 각 코스가 A, B, C 형태로 있을 것임
	#다시 말해 lang이 만약에 한국어(ko)라면 ./courses/ko/A/ 및 ./courses/ko/B/ ./courses/ko/C/ 폴더가 있을 것입니다. 
	#이런 폴더들을 해당 언어의 해당 코스의 폴더라고 합시다. 
	#해당 언어 해당 코스 폴더에는 content.tsv라는 파일과 content_info.json이라는 파일이 있습니다. 
	#현재 생성된 개인 사용자용 개인 디렉토리인 ./users/u/user@email.com 폴더 밑에 현재 사용자가 입력한 ko라는 lang값에 대해서
	# 다음과 같은 폴더가 생깁니다.
	# ./users/u/user@email.com/courses/ko/A/ 라는 폴더와 ./users/u/user@email.com/courses/ko/B/
	# ./users/u/user@email.com/courses/ko/C/ 라는 폴더가 생성되고 해당 폴더 밑에 각각 myprogress.tsv라는 파일이 생성됩니다.
	# myprogress.tsv 파일에는 다음과 같은 내용이 채워집니다.
    #                     [level,esp,kor,eng,group,count,repeat_date]
    #                     [Saluton-A,Mi amas,사랑합니다,I love you,group1,3,2023-05-10 14:20:15]
    #                     [Saluton-A,Mi gxojas,기쁩니다,I glad,group7,0,""]
	# 
	#output: userid, email, cookie:login_status, lang, courses{제목, 짧은 설명, 긴 설명, Points, Progress, Total_count, Needs_Review, Not_Seen, Familiar, Mastered}


	
	result = {'resp': 'OK', 'user': email1, 'email': email1}
	resp = make_response(jsonify(result))
	resp.set_cookie('login_status', 'success')
	return resp


# @app.route('/api/login.api', methods=['POST', 'GET'])
# def login():
# 	# if request.method == 'GET':
# 	# 	email1 = request.args['email1']
# 	# 	email2 = request.args['email2']
# 	# else:
# 	# 	email1 = request.form['email1']
# 	# 	email2 = request.form['email2']

# 	email1 = request.json['email1']
# 	email2 = request.json['email2']
# 	if email1 == email2:
# 		result = {'resp': 'OK', 'user': email1}
# 		resp = make_response(jsonify(result))
# 		resp.set_cookie('login_status', 'success')
# 		return resp
# 	else:
# 		result = {'resp': 'Fail', 'user': ''}
# 		resp = make_response(jsonify(result))
# 		resp.set_cookie('login_status', 'fail')
# 		return resp

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


