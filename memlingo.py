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

def create_user(email, lang):
    # 개인 홈 디렉토리 생성
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
	
    # 해당 언어 lang에 대응 되는 개인별 코스와 개인 progress 저장을 위한 개인 디렉토리를 개인 홈에 만들어 준다 
    user_courses_lang_dir = os.path.join(user_dir, "courses", lang)
    # A, B, C 각각의 디렉토리를 생성한다
    for root, dirs, files in os.walk("./courses/"+lang): #마스터 코스 목록 lang 하위의 마스터 코스 목록
        for course_name in dirs:
            os.makedirs(os.path.join(user_courses_lang_dir, course_name)) #개인 홈 디렉토리 밑에 있는 개인용 코스
            file_path = os.path.join(user_courses_lang_dir, course_name, "myprogress.tsv")
            with open(file_path, "w") as f:
                f.write("[level,esp,kor,eng,group,count,repeat_date]\n") #TODO, 실제 내용을 정확한 내용을 적는다 마스터 코스에 있는 content.tsv 파일 하나하나 가져와서 이런 규격으로 가져와서 넣는다.



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
	
	# lang 검증
	found = False
	for root, dirs, files in os.walk("./courses"):
		for name in dirs:
			if name == lang:
				found = True
				break
	if not found:
		result = {'resp': 'Fail', 'message': 'language is not supported'}
		resp = make_response(jsonify(result))
		resp.set_cookie('login_status', 'fail')
		return resp	
	
	#처음에 들어온 이메일 이면 해당 사용자의 홈 디렉토리를 만들고, 해당 폴더를 초기화 시켜준다.
	user_dir = os.path.join("./users", email1[0], email1)
	if not os.path.exists(user_dir):
		create_user(email1, lang)

	#마스터 lang/코스 별로 course_info.json를 읽어온다
	course_infos = {}
	courses_lang_dir = os.path.join("./courses",lang)
	for root, dirs, files in os.walk(courses_lang_dir): #마스터 코스 목록 lang 하위의 마스터 코스 목록
		for course_name in dirs:
			content_info_json = courses_lang_dir +'/'+ course_name +'/'+ "content_info.json"
			#TODO Json 파일을 읽어서 course_info 라는 객체를 만든다.
			#TODO content.tsv파일 라인수를 total_count로 읽어드린다.
			course_info['total_count'] = total_count
			course_infos[course_name] = course_info
			

	#개인 코스 별 진도를 읽어온다.
	user_courses = []		
	user_dir = os.path.join("./users", email[0], email)
	user_courses_lang_dir = os.path.join(user_dir, "courses", lang)
    # A, B, C 각각의 디렉토리를 생성한다
	for root, dirs, files in os.walk("./courses/"+lang): #마스터 코스 목록 lang 하위의 마스터 코스 목록
		for course_name in dirs:
			user_course = {} #"subject":subject, "description":description, "short_description":short_description, "points":points, "progress":progress, "total_count":total_count, "needs_review":need_review, "not_seen":not_seen, "familiar":familiar, "mastered":mastered}
			user_course['course_name'] = course_name
			user_course['name'] = course_infos[course_name]['name']
			user_course['description'] = course_infos[course_name]['description']
			user_course['short_description'] = course_infos[course_name]['short_description']
			user_course['total_count'] = course_infos[course_name]['total_count'] 
			#myprogress.tsv 파일을 읽어서 user_course 객체에 각 진도값을 채워 넣는다
			#TODO points는 사용자가 공부한 총 카운트 수 = myprogress.tsv 파일의 count 칼럼의 총합 
			#TODO myprogress.tsv파일의 count 칼럼 값을 기준으로 카운트 값이 4 이상이면 완료 한 것임. progress는 완료한 것과 total_count 사이의 비율을 백분율로 나눈것.
			#TODO needs_review는 myprogress.tsv파일의 next_review_time 칼럼의 시간을 기준으로 현재 대비 과거 인 것 들을 갯수 
			user_course['points'] = points
			user_course['progress'] = progress
			user_course['needs_review'] = needs_review
			user_course['familiar'] = familiar
			user_course['mastered'] = mastered
			user_courses.append(user_course)
	
	result = {'resp': 'OK', 'user': email1[:email1.find('@')], 'email': email1, "lang": lang, "courses": user_courses}
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


