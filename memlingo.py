from flask import Flask, send_from_directory, request, make_response, jsonify
import os, re, json, datetime

app = Flask(__name__)

# PAGES 파일 서비스
@app.route('/pages/<path:path>')
def serve_pages(path):
    return send_from_directory('pages', path)

def is_valid_email(email):
    # 이메일 주소에 대한 정규 표현식(Regular Expression)
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def create_user(email, lang):
    # 개인 홈 디렉토리 생성
    user_dir = os.path.join("./users", email[0], email)
    if not os.path.exists(user_dir):
        os.makedirs(user_dir)

    # userinfo.json 파일 생성
    user_info = {
        "userid": email[:email.find('@')],
        "email": email,
        "last_login": datetime.time().strftime("%Y-%m-%d %H:%M:%S"),
        "admin_flag": "false"
    }
    user_info_file = os.path.join(user_dir, "userinfo.json")
    with open(user_info_file, "w") as f:
        json.dump(user_info, f)
    
    # 유저 하위 디렉토리에 course/lang 디렉토리를 만들어 준다.
    user_courses_lang_dir = os.path.join(user_dir, "courses", lang)
    if not os.path.exists(user_courses_lang_dir):
        os.makedirs(user_courses_lang_dir)

    # lang/course에 대응 되는 개인별 lang/course의 개인별 progress 를 개인 홈에 만들어 준다.
    for course_name in dirs_in("./courses/"+lang): #마스터 코스 목록 lang 하위의 마스터 코스 목록
        master_content_tsv = os.path.join("./courses", lang, course_name, "content.tsv")
        os.makedirs(os.path.join(user_courses_lang_dir, course_name)) #개인 홈 디렉토리 밑에 있는 개인용 코스
        myprogress_tsv = os.path.join(user_courses_lang_dir, course_name, "myprogress.tsv")
        f1 = open(master_content_tsv, 'r', encoding = 'utf-8')
        f2 = open(myprogress_tsv, 'w', encoding = 'utf-8')
        for line in f1:
            #[0]level1	[1]esp1	[2]kor1	[3]eng1	[4]group1	[5]alternative1	[6]prononcation1
            row = line.split('\t')
            row[5] = '0' #master_content_tsv 의 4번째 필드는 Alternative인데 myprogress_tsv의 4번째 필드는 Count임
            row[6] = '-' #master_content_tsv 의 5번째 필드는 Prononcation인데 myprogress_tsv의 5번째 필드는 Next Review Time임
            f2.write('\t'.join(row)+'\n')
        f1.close()
        f2.close()

def dirs_in(target_dir):
    return [f.name for f in os.scandir(target_dir) if f.is_dir()]

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
        if request.headers.get('Content-Type').find("application/json") >= 0: #컨텐트 타입 헤더가 aplication/json이면
            email1 = request.json['email1']
            email2 = request.json['email2']
            lang = request.json['lang']
        else: #헤더가 applicaiont/x-www-url-encoded이면: 
            email1 = request.form['email1']
            email2 = request.form['email2']
            lang = request.form['lang']

    #이메일 검증과 lang 검증을 하고,
    if email1 != email2 or not is_valid_email(email1):
        result = {'resp': 'Fail', 'message': 'email is invalid or email1 is not same to email2'}
        resp = make_response(jsonify(result))
        resp.set_cookie('login_status', 'fail')
        return resp
    
    # lang 검증 ./courses 폴더 밑에 lang 이라는 폴더가 있어야함
    if lang not in dirs_in("./courses"):
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
    for course_name in dirs_in(courses_lang_dir): #마스터 코스 목록 lang 하위의 마스터 코스 목록
        master_content_tsv = os.path.join("./courses", lang, course_name, "content.tsv")
        course_info_json = courses_lang_dir +'/'+ course_name +'/'+ "course_info.json"
        #Json 파일을 읽어서 course_info 라는 객체를 만든다.
        with open(course_info_json, 'r') as f:
            course_info = json.load(f)
            # {name:"Esperanto A (Memlingo 에스페란토)",
            # description: "Esperanto A (Memlingo 에스페란토) description",
            # short_description: "Esperanto A (Memlingo 에스페란토) short_description",
            # tags: "",source: "",target: "",audio_mode: "",base_url: "",course_status: ""
            # }
        course_infos[course_name] = course_info
            

    #개인 코스 별 진도를 읽어온다.
    user_courses = {}		
    user_dir = os.path.join("./users", email1[0], email1)
    user_courses_lang_dir = os.path.join(user_dir, "courses", lang)
    # A, B, C 각각의 디렉토리를 생성한다
    for course_name in dirs_in("./courses/"+lang):#마스터 코스 목록 lang 하위의 마스터 코스 목록
        user_course = {} #"subject":subject, "description":description, "short_description":short_description, "points":points, "progress":progress, "total_count":total_count, "needs_review":need_review, "not_seen":not_seen, "familiar":familiar, "mastered":mastered}
        user_course['course_name'] = course_name
        user_course['name'] = course_infos[course_name]['name']
        user_course['description'] = course_infos[course_name]['description']
        print(json.dumps(course_infos[course_name]))
        user_course['short_description'] = course_infos[course_name]['short_description']
        
        #myprogress.tsv 파일을 읽어서 user_course 객체에 각 진도값을 채워 넣는다
        done_count = 0 # progress는 완료한 것(4이상)과 total_count 사이의 비율을 백분율로 나눈것.
        points = 0 # points는 사용자가 공부한 총 카운트 수 = myprogress.tsv 파일의 count 칼럼의 총합
        familiar_count = 0 #카운트가 5이상인 것들의 갯수
        mastered_count = 0 #카운트가 6이상인 것들의 갯수
        needs_review_count = 0 #needs_review는 myprogress.tsv파일의 next_review_time 칼럼의 시간을 기준으로 현재 대비 과거 인 것 들을 갯수 
        total_count = 0 #총라인 갯수
        now_str = datetime.time().strftime("%Y-%m-%d %H:%M:%S")
        myprogress_tsv = os.path.join(user_courses_lang_dir, course_name, "myprogress.tsv")
        f = open(myprogress_tsv, 'r', encoding = 'utf-8')
        for line in f:
            #[0]level1	[1]esp1	[2]kor1	[3]eng1	[4]group1	[5]count	[6]next_review_time
            row = line.split('\t')
            if int(row[5]) >= 4: done_count += 1
            if int(row[5]) >= 5: familiar_count += 1
            if int(row[5]) >= 6: mastered_count += 1
            if row[6] < now_str: needs_review_count += 1
            total_count += 1
            points += int(row[5])
        f.close()
        user_course['total_count'] = total_count 
        user_course['points'] = points
        user_course['progress'] = int(float(done_count)/float(total_count)*100.0)
        user_course['needs_review'] = needs_review_count
        user_course['familiar'] = familiar_count #카운트가 5이상인 것들의 갯수
        user_course['mastered'] = mastered_count #카운트가 6이상인 것들의 갯수
        user_courses[course_name] = user_course
    
    result = {'resp': 'OK', 'user': email1[:email1.find('@')], 'email': email1, "lang": lang, "user_courses": user_courses}
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

try:
    app.run(debug=True, host='192.168.117.129', port=5002)
except Exception as e:
    print('Error:', e)
    

