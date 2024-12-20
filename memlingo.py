from flask import Flask, send_from_directory, request, make_response, jsonify, redirect, url_for, send_file
import os, re, json, datetime, random, time, urllib.parse, fcntl

app = Flask(__name__)

# flash.html이 root가 되게 한다..
@app.route('/')
def serve_root():
    return redirect('/pages/flash.html')
    # return serve_pages('/pages/flash.html')
    # return redirect(url_for('/pages/flash.html'))
    # return '<meta http-equiv="refresh" content="0; url=/pages/flash.html" />'

# favicon.ico 파일 서비스
@app.route('/favicon.ico')
def serve_favicon():
    return send_from_directory('.', 'favicon.ico')

def LOG(log_line):
    log_file = "./logs/"+time.strftime("%Y-%m-%d", time.localtime())+".log"
    f = open(log_file, '+a', encoding='utf-8')
    log_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    f.write(log_time+'\t'+log_line+'\n')
    f.close()

# PAGES 파일 서비스
@app.route('/pages/<path:path>')
def serve_pages(path):
    return send_from_directory('pages', path)

@app.route('/dialog/<path:path>')
def serve_dialog(path):
    return send_from_directory('dialog', path)

@app.route('/sounds/<path:path>')
def serve_sounds(path):
    return send_from_directory('sounds', path)

def is_valid_email(email):
    # 이메일 주소에 대한 정규 표현식(Regular Expression)
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def my_course_dir(email, lang, course):
    return os.path.join("./users", email[0], email,'courses', lang, course)

def is_recent_login(email):
    # 개인 홈 디렉토리 생성
    user_dir = os.path.join("./users", email[0], email)
    if not os.path.exists(user_dir):
        os.makedirs(user_dir)

    user_info = {}
    user_info_file = os.path.join(user_dir, "userinfo.json")
    with open(user_info_file, "r", encoding='utf-8') as f:
        user_info_json = f.read()    
        user_info = json.loads(user_info_json)
    yesterday = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time.time() - 48*3600))
    if yesterday <= user_info["last_login"]:
        return True
    else:
        return False

def unsubscribe_email(email):
    # 개인 홈 디렉토리 생성
    user_dir = os.path.join("./users", email[0], email)
    if not os.path.exists(user_dir):
        os.makedirs(user_dir)

    user_info = {}
    user_info_file = os.path.join(user_dir, "userinfo.json")
    with open(user_info_file, "r", encoding='utf-8') as f:
        user_info_json = f.read()    
        user_info = json.loads(user_info_json)
        user_info["unsubscribe"] = "YES"

    with open(user_info_file, "w", encoding='utf-8') as f:
        json.dump(user_info, f)  


def update_experience_points_duration(email, point, duration):
    # 개인 홈 디렉토리 생성
    user_dir = os.path.join("./users", email[0], email)
    if not os.path.exists(user_dir):
        os.makedirs(user_dir)

    user_info = {}
    user_info_file = os.path.join(user_dir, "userinfo.json")
    with open(user_info_file, "r", encoding='utf-8') as f:
        user_info_json = f.read()    
        user_info = json.loads(user_info_json)
        if not "experience_points" in user_info:
            user_info["experience_points"] = "0"
        if not "duration" in user_info:
            user_info["duration"] = "0"
        user_info["experience_points"] = int(user_info["experience_points"])
        user_info["experience_points"] += point
        user_info["experience_points"] = str(user_info["experience_points"])
        user_info["duration"] = int(user_info["duration"])
        user_info["duration"] += duration
        user_info["duration"] = str(user_info["duration"])

    with open(user_info_file, "w", encoding='utf-8') as f:
        json.dump(user_info, f)    

def update_last_login(email):
    # 개인 홈 디렉토리 생성
    user_dir = os.path.join("./users", email[0], email)
    if not os.path.exists(user_dir):
        os.makedirs(user_dir)

    user_info = {}
    user_info_file = os.path.join(user_dir, "userinfo.json")
    with open(user_info_file, "r", encoding='utf-8') as f:
        user_info_json = f.read()    
        user_info = json.loads(user_info_json)
        user_info["last_login"] = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

    with open(user_info_file, "w", encoding='utf-8') as f:
        json.dump(user_info, f)

def create_user(email, lang):
    # 개인 홈 디렉토리 생성
    user_dir = os.path.join("./users", email[0], email)
    if not os.path.exists(user_dir):
        os.makedirs(user_dir)

    # userinfo.json 파일 생성
    user_info = {
        "userid": email[:email.find('@')],
        "email": email,
        "user_created": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),
        "last_login": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),
        "experience_points": "0",
        "admin_flag": "false"
    }
    user_info_file = os.path.join(user_dir, "userinfo.json")
    with open(user_info_file, "w", encoding='utf-8') as f:
        json.dump(user_info, f)

    create_user_courses_lang(email, lang)
    

def create_user_courses_lang(email, lang):
    user_dir = os.path.join("./users", email[0], email)
    # 유저 하위 디렉토리에 course/lang 디렉토리를 만들어 준다.
    user_courses_lang_dir = os.path.join(user_dir, "courses", lang)
    if not os.path.exists(user_courses_lang_dir):
        os.makedirs(user_courses_lang_dir)

    # lang/course에 대응 되는 개인별 lang/course의 개인별 progress 를 개인 홈에 만들어 준다.
    if not os.path.exists("./courses/"+lang):
        result = {'resp': 'Fail', "message": "folder not found :"+"./courses/"+lang}
        resp = make_response(jsonify(result))
        return resp

    for course_name in dirs_in("./courses/"+lang): #마스터 코스 목록 lang 하위의 마스터 코스 목록
        master_content_tsv = os.path.join("./courses", lang, course_name, "content.tsv")
        os.makedirs(os.path.join(user_courses_lang_dir, course_name)) #개인 홈 디렉토리 밑에 있는 개인용 코스
        myprogress_tsv = os.path.join(user_courses_lang_dir, course_name, "myprogress.tsv")
        f1 = open(master_content_tsv, 'r', encoding = 'utf-8')
        f2 = open(myprogress_tsv, 'w', encoding = 'utf-8')
        fcntl.flock(f2, fcntl.LOCK_EX)
        for line in f1:
            #[0]level1	[1]esp1	[2]kor1	[3]eng1	[4]group1	[5]alternative1	[6]prononcation1
            row = line.strip().split('\t')
            if len(row) <5:
                continue
            if row[0] == "Level" and row[1] == "Esperanto":
                continue
            row = row[0:5]
            row.append('0    ')
            row.append('0000-00-00 00:00:00')
            f2.write('\t'.join(row)+'\n')
        fcntl.flock(f2, fcntl.LOCK_UN)
        f2.close()
        f1.close()
        

def dirs_in(target_dir):
    return [f.name for f in os.scandir(target_dir) if f.is_dir()]

@app.route('/api/get_course_info.api', methods=['POST', 'GET'])
def get_course_info():
    if request.method == 'GET':
        email = request.args['email']
        lang = request.args['lang']
    else:
        if request.headers.get('Content-Type').find("application/json") >= 0: #컨텐트 타입 헤더가 aplication/json이면
            email = request.json['email']
            lang = request.json['lang']
        else: #헤더가 applicaiont/x-www-url-encoded이면: 
            email = request.form['email']
            lang = request.form['lang']
    LOG("/api/get_course_info.api\t%s\t%s" % (email, lang))

    #마스터 lang/코스 별로 course_info.json를 읽어온다
    course_infos = {}
    courses_lang_dir = os.path.join("./courses",lang)
    if not os.path.exists(courses_lang_dir):
        result = {'resp': 'Fail', "message": "folder not found :"+courses_lang_dir}
        resp = make_response(jsonify(result))
        return resp
    
    for course_name in dirs_in(courses_lang_dir): #마스터 코스 목록 lang 하위의 마스터 코스 목록
        master_content_tsv = os.path.join("./courses", lang, course_name, "content.tsv")
        course_info_json = courses_lang_dir +'/'+ course_name +'/'+ "course_info.json"
        #Json 파일을 읽어서 course_info 라는 객체를 만든다.
        with open(course_info_json, 'r', encoding='utf-8') as f:
            course_info = json.load(f)
            # {name:"Esperanto A (Memlingo 에스페란토)",
            # description: "Esperanto A (Memlingo 에스페란토) description",
            # short_description: "Esperanto A (Memlingo 에스페란토) short_description",
            # tags: "",source: "",target: "",audio_mode: "",base_url: "",course_status: ""
            # }
        course_infos[course_name] = course_info       

    #개인 코스 별 진도를 읽어온다.
    user_courses = {}		
    user_dir = os.path.join("./users", email[0], email)
    user_courses_lang_dir = os.path.join(user_dir, "courses", lang)
    # A, B, C 각각의 디렉토리를 생성한다
    if not os.path.exists("./courses/"+lang):
        result = {'resp': 'Fail', "message": "folder not found :"+"./courses/"+lang}
        resp = make_response(jsonify(result))
        return resp
    
    if not os.path.exists(user_courses_lang_dir):
        create_user_courses_lang(email, lang)

    for course_name in dirs_in("./courses/"+lang):#마스터 코스 목록 lang 하위의 마스터 코스 목록
        user_course = {} #"subject":subject, "description":description, "short_description":short_description, "points":points, "progress":progress, "total_count":total_count, "needs_review":need_review, "not_seen":not_seen, "familiar":familiar, "mastered":mastered}
        user_course['course_name'] = course_name
        user_course['name'] = course_infos[course_name]['name']
        user_course['description'] = course_infos[course_name]['description']
        print(json.dumps(course_infos[course_name]))
        user_course['short_description'] = course_infos[course_name]['short_description']
        
        #myprogress.tsv 파일을 읽어서 user_course 객체에 각 진도값을 채워 넣는다
        started_count = 0
        done_count = 0 # progress는 완료한 것(4이상)과 total_count 사이의 비율을 백분율로 나눈것.
        points = 0 # points는 사용자가 공부한 총 카운트 수 = myprogress.tsv 파일의 count 칼럼의 총합
        familiar_count = 0 #카운트가 5이상인 것들의 갯수
        mastered_count = 0 #카운트가 6이상인 것들의 갯수
        needs_review_count = 0 #needs_review는 myprogress.tsv파일의 next_review_time 칼럼의 시간을 기준으로 현재 대비 과거 인 것 들을 갯수 
        total_count = 0 #총라인 갯수
        now_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        myprogress_tsv = os.path.join(user_courses_lang_dir, course_name, "myprogress.tsv")
        f = open(myprogress_tsv, 'r', encoding = 'utf-8')
        # rows = []
        for line in f:
            #[0]level1	[1]esp1	[2]kor1	[3]eng1	[4]group1	[5]count	[6]next_review_time
            row = line.strip().split('\t')
            if len(row) < 7:
                continue
            # rows.append(row)
            if int(row[5].strip()) >= 4: mastered_count += 1   
            elif int(row[5].strip()) >= 3: familiar_count += 1  
            elif int(row[5].strip()) >= 1: done_count += 1                               
            elif int(row[5].strip()) > 0: started_count += 1

            if row[6] != '0000-00-00 00:00:00' and row[6] < now_str: needs_review_count += 1
            total_count += 1
            points += int(row[5].strip())
        f.close()
        user_course['total_count'] = total_count 
        user_course['points'] = points
        progress = 0.0
        progress += started_count * 0.1
        progress += done_count * 0.3
        progress += familiar_count * 0.5
        progress += mastered_count * 1.0
        user_course['progress'] = "%.2f" % float(progress/float(total_count)*100.0)
        # user_course['progress'] = "%.2f" % calc_progress(rows)
        user_course['needs_review'] = needs_review_count
        user_course['familiar'] = familiar_count #카운트가 3이상인 것들의 갯수
        user_course['mastered'] = mastered_count #카운트가 6이상인 것들의 갯수
        user_courses[course_name] = user_course
        
    result = {'resp': 'OK', "user_courses": user_courses}
    resp = make_response(jsonify(result))
    return resp

@app.route('/api/unsubscribe.api', methods=['GET'])
def unsubscribe():
    if request.method == 'GET':
        email = request.args['email']
    LOG("/api/unsubscribe.api\t%s" % (email))
    unsubscribe_email(email)
    resp = "<br><br><br>Successfully unsubscribed. Thank you.<br><br><br>"
    return resp

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
    
    LOG("/api/login.api\t%s\t%s\t%s" % (email1, email2, lang))
    
    # lang 검증 ./courses 폴더 밑에 lang 이라는 폴더가 있어야함
    if not os.path.exists("./courses"):
        result = {'resp': 'Fail', "message": "folder not found :"+"./courses"}
        resp = make_response(jsonify(result))
        return resp

    if lang not in dirs_in("./courses"):
        result = {'resp': 'Fail', 'message': 'language is not supported'}
        resp = make_response(jsonify(result))
        resp.set_cookie('login_status', 'fail')
        return resp	
    
    #처음에 들어온 이메일 이면 해당 사용자의 홈 디렉토리를 만들고, 해당 폴더를 초기화 시켜준다.
    user_dir = os.path.join("./users", email1[0], email1)
    if (not os.path.exists(user_dir)) or (not os.path.exists(user_dir+"/userinfo.json")):
        create_user(email1, lang)

    # if is_recent_login(email1):
    #     update_experience_points(email1, 10)
    # else:
    #     update_experience_points(email1, 5)
    update_last_login(email1)

    result = {'resp': 'OK', 'user': email1[:email1.find('@')], 'email': email1, "lang": lang}
    resp = make_response(jsonify(result))
    resp.set_cookie('login_status', 'success')
    return resp


@app.route('/api/logout.api', methods=['POST'])
def logout():
    if request.method == 'GET':
        email = request.args['email']
        lang = request.args['lang']
        course = request.args['course']
    else:
        if request.headers.get('Content-Type').find("application/json") >= 0: #컨텐트 타입 헤더가 aplication/json이면
            email = request.json['email']
            lang = request.json['lang']
            course = request.json['course']
        else: #헤더가 applicaiont/x-www-url-encoded이면: 
            email = request.form['email']
            lang = request.form['lang']
            course = request.form['course']
    LOG("/api/logout.api\t%s\t%s\t%s" % (email, lang, course))
    result = {'resp': 'OK', 'message': 'Successfully loged out'}
    resp = make_response(jsonify(result))
    resp.set_cookie('login_status', 'loged_out')
    return resp

@app.route('/api/session-finish.api', methods=['POST'])
def session_finish():
    if request.method == 'GET':
        email = request.args['email']
        lang = request.args['lang']
        course = request.args['course']
        duration = request.args['duration']
    else:
        if request.headers.get('Content-Type').find("application/json") >= 0: #컨텐트 타입 헤더가 aplication/json이면
            email = request.json['email']
            lang = request.json['lang']
            course = request.json['course']
            duration = request.json['duration']
        else: #헤더가 applicaiont/x-www-url-encoded이면: 
            email = request.form['email']
            lang = request.form['lang']
            course = request.form['course']
            duration = request.form['duration']
    LOG("/api/session-finish.api\t%s\t%s\t%s" % (email, lang, course))
    
    duration = int(duration)
    if duration <= 0 or duration > 15*60:
        duration = 15*60
    update_experience_points_duration(email, 10, duration)

    result = {'resp': 'OK', 'message': 'Session finished'}
    resp = make_response(jsonify(result))
    return resp

@app.route('/api/session-start.api', methods=['POST'])
def session_start():
    if request.method == 'GET':
        email = request.args['email']
        lang = request.args['lang']
        course = request.args['course']
    else:
        if request.headers.get('Content-Type').find("application/json") >= 0: #컨텐트 타입 헤더가 aplication/json이면
            email = request.json['email']
            lang = request.json['lang']
            course = request.json['course']
        else: #헤더가 applicaiont/x-www-url-encoded이면: 
            email = request.form['email']
            lang = request.form['lang']
            course = request.form['course']
    LOG("/api/session-start.api\t%s\t%s\t%s" % (email, lang, course))
    result = {'resp': 'OK', 'message': 'Session started'}
    resp = make_response(jsonify(result))
    return resp

def next_review_time(count, score):
    #다음 리뷰 시간 정하는 규칙
    #1. 만약 처음이면(count == 0) +2분 후로 
    #2. count == 1 이면 +20분 후로
    #2. count == 2 이면 +5시간 후로
    #2. count == 3 이면 +1일 후로
    #2. count == 4 이면 +이틀 후로
    #2. count == 5 이면 +10일 후로
    #2. count == 6 이면 +20일 후로
    #2. count == 7 이면 +60일 후로
    #2. count == 8 이면 +180일 후로
    #2. count가 +9 이상이면 +720일 후로
    #옵션1. 만약에 스코어가 마이너스면 정상값의 절반으로
    #옵션2. 만약에 스코어가 마이너스면 count를 절반으로

    if score < 0:
        count = int(count/2)
    elif score == 2:
        count += 1

    t0 = time.time()
    if count == 0: next_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(t0 + 2*60))
    if count == 1: next_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(t0 + 20*60))
    if count == 2: next_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(t0 + 12*60*60))
    if count == 3: next_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(t0 + 2*24*60*60))
    if count == 4: next_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(t0 + 10*24*60*60))
    if count == 5: next_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(t0 + 20*24*60*60))
    if count == 6: next_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(t0 + 60*24*60*60))
    if count == 7: next_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(t0 + 180*24*60*60))
    if count >= 8: next_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(t0 + 720*24*60*60))

    return (count, next_str)

@app.route('/api/playsound.api', methods=['POST', 'GET'])
def playsound():
    if request.method == 'GET':
        email = request.args['email']
        voice_esp_txt_mp3 = request.args['voice_esp_txt_mp3']
    else:
        if request.headers.get('Content-Type').find("application/json") >= 0: #컨텐트 타입 헤더가 aplication/json이면
            email = request.json['email']
            voice_esp_txt_mp3 = request.json['voice_esp_txt_mp3']
        else: #헤더가 applicaiont/x-www-url-encoded이면: 
            email = request.form['email']
            voice_esp_txt_mp3 = request.form['voice_esp_txt_mp3']
            
    filename = "sounds/"+voice_esp_txt_mp3
    print(filename)
    
    LOG("/api/playsound.api\t%s\t%s" % (email, voice_esp_txt_mp3))

    # 해당 음성 파일이 없으면 여러 음성을 대조해서 찾아보고 그래도 없으면 딩동을 내보낸다.
    if voice_esp_txt_mp3 == "":
        filename = "sounds/dingdong.mp3"
    elif not os.path.exists(filename):
        filename = "sounds/dingdong.mp3"
        voicelist = ['male1','male2','female1','female2','ludoviko']
        esp_txt_mp3 = voice_esp_txt_mp3[voice_esp_txt_mp3.find("/") + 1:]
        for voice in voicelist:
            if os.path.exists("sounds/" + voice + "/" + esp_txt_mp3):
                filename = "sounds/" + voice + "/" + esp_txt_mp3
                break
    
    if filename == "sounds/dingdong.mp3" and voice_esp_txt_mp3 != "":
        LOG("/api/playsound.api\t%s\t%s" % ("ERROR: file not found.", voice_esp_txt_mp3))

    return send_file(filename, mimetype='audio/mpeg')

@app.route('/api/card-next.api', methods=['POST', 'GET'])
def card_next():
    if request.method == 'GET':
        email = request.args['email']
        course = request.args['course']
        lang = request.args['lang']
        esp_txt = request.args['esp_txt']
        score = request.args['score']
        index = request.args['index']
    else:
        if request.headers.get('Content-Type').find("application/json") >= 0: #컨텐트 타입 헤더가 aplication/json이면
            email = request.json['email']
            course = request.json['course']
            lang = request.json['lang']
            esp_txt = request.json['esp_txt']
            score = request.json['score']
            index = request.json['index']
        else: #헤더가 applicaiont/x-www-url-encoded이면: 
            email = request.form['email']
            course = request.form['course']
            lang = request.form['lang']
            esp_txt = request.form['esp_txt']
            score = request.form['score']
            index = request.form['index']
    # LOG("/api/card-next.api\t%s\t%s\t%s\t%s\t%s" % (email, course, lang, esp_txt, score))
      
    if esp_txt != "":
        myprogress_tsv = my_course_dir(email,lang,course)+'/myprogress.tsv'
        f = open(myprogress_tsv, 'rb+') # 바이너리 모드, rw모드로 파일 오픈
        fcntl.flock(f, fcntl.LOCK_EX)
        data = f.read() # 파일 내용 통째로를 데이터에 바이너리로 읽어들임
        data_lines = data.split(b'\n') # 바이너리 \n을 기준으로 라인단위로 쪼갬
        prev_pos = 0
        for data_line in data_lines: # 각각의 바이너리 라인 기준으로 
            line = data_line.decode("utf-8") # 바이너리 라인을 일반 utf-8 텍스트 라인으로 바꿈
            #  [0]level,[1]esp_txt,[2]kor,[3]eng,[4]group,[5]count,[6]next-review-time
            row = line.strip().split('\t')
            if len(row) < 7:
                continue
            if row[1] == esp_txt:
                #사용자가 보내온 스코어 값과 이 아이템의 카운트에 따라서 다음에 리뷰할 시간을 결정해서 적어 놓는다.
                (next_count, next_review_str) = next_review_time(int(row[5].strip()), int(score)) 
                row[5] = "%-5d" % (next_count + 1)
                row[6] = next_review_str
                line = "\t".join(row)+'\n'
                f.seek(prev_pos, 0) # 이 라인의 맨 앞 포지션으로 파일 커서를 옮긴다 
                f.write(line.encode("utf-8")) # 변경된 한 라인을 utf-8 인코드로 바이너리 라인을 만들어 오버라이트 하고 끝낸다 
                break
            # lines.append(line)
            prev_pos += len(data_line) + 1 # 현재 라인 길이만큼 포지션을 이동한다
        fcntl.flock(f, fcntl.LOCK_UN)
        f.close()

        # f = open(myprogress_tsv, 'w', encoding='utf-8')
        # f.write("".join(lines))
        # f.close()

    #새로 학습할 카드를 선택해서 사용자에게 리턴한다.
    #     //         output: 
    #     //                quiz-card-url, 퀴즈 카드 유형을 랜덤으로 정해서 보내옴
    #     //                level,esp_txt,kor,eng,group,count,next-review-time, = myprgress.tsv파일의 한 라인임
    
    myprogress_tsv = my_course_dir(email,lang,course)+'/myprogress.tsv'
    next_row = []
    nowstr = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time.time()))
    oldest_str = ""
    oldest_row = []
    
    f = open(myprogress_tsv, 'r', encoding='utf-8')
    for i, line in enumerate(f):
        #  [0]level,[1]esp_txt,[2]kor,[3]eng,[4]group,[5]count,[6]next-review-time
        row = line.strip().split('\t')
        if len(row) < 7:
            continue
        if row[6] == '0000-00-00 00:00:00':
            next_row = row
            break
        elif row[6] <= nowstr and index != "0" and index != "1": #처음 2개는 항상 새로운 단어를 제시한다. (오래된 것이 선택되지 않게 막는다.)
            next_row = row
            break
        if oldest_str == "":
            oldest_str = row[6]
            oldest_row = row
        if row[6] <= oldest_str:
            oldest_str = row[6]
            oldest_row = row
    f.close()
    

    if len(next_row) < 7:
        if len(oldest_row) < 7:
            LOG("/api/card_next.api\t%s\t%s\t%s\t%s" % (email, lang, course, "ERROR: Cannot find next row:" + str(next_row)))
            result = {'resp': 'Fail', 'message': 'Cannot find oldest row:'+str(next_row)}
            resp = make_response(jsonify(result))
            resp.set_cookie('login_status', 'loged_out')
            return resp
        else:
            next_row = oldest_row

    if next_row[6] == '0000-00-00 00:00:00':
        quizlist = ['quizA','quizC','quizD','quizE','quizF','quizG','quizH','quizI']
        quiz_card = random.choice(quizlist)
        quiz_card_url = './'+quiz_card+'.html'
    else:
        quizlist = ['quizB','quizC','quizD','quizG','quizH','quizI']
        quiz_card = random.choice(quizlist)
        quiz_card_url = './'+quiz_card+'.html'

    #TODO 현재 음성 파일이 없어서 음성 파일들을 생성해서 저장해 놔야함 
    voicelist = ['male1','male2','female1','female2','ludoviko']
    mp3list = []
    for voice in voicelist:
        mp3_url = voice+'/'+next_row[1]+'.mp3'
        print("mp3_url:"+mp3_url) 
        if os.path.exists("./sounds/"+mp3_url):
            mp3list.append([voice, mp3_url])
    print("mp3list:"+ str(mp3list))
    voice = ""
    mp3_url = ""
    voice_img_url = ""
    if len(mp3list) == 0:
        voice = "ludoviko"
        mp3_url = "dingdong.mp3"
        voice_img_url ="./img/ludoviko.png" 
    elif len(mp3list) > 0:
       [voice, mp3_url] = random.choice(mp3list)
       voice_img_url = './img/'+voice+'.png'

    LOG("/api/card-next.api\t%s\t%s\t%s\t%s\t%s\t%s\t%s" % (email, course, lang, next_row[1], next_row[5].strip(), quiz_card_url, voice))
    result = {'resp': 'OK', 'level': next_row[0], 'esp_txt': next_row[1], 'kor_txt': next_row[2], 'eng_txt': next_row[3], 'group': next_row[4], 'count':next_row[5].strip(), 'next_review_time': next_row[6], 'quiz_card_url':quiz_card_url, 'mp3_url':mp3_url, 'voice_img_url':voice_img_url, 'voice':voice}
    resp = make_response(jsonify(result))
    return resp

def get_word_to_word_diff(word1, word2):
    # 단어를 문자 집합으로 변환
    set1 = set(word1)
    set2 = set(word2)

    # 두 집합의 자카드 유사도 계산
    similarity = len(set1 & set2) / len(set1 | set2) #0.0부터 1.0 사이
    return 1 - similarity #0.0부터 1.0 사이


@app.route('/api/similar-words-kor.api', methods=['POST', 'GET'])
def similar_words_kor():
    if request.method == 'GET':
        email = request.args['email']
        course = request.args['course']
        lang = request.args['lang']
        kor_txt = request.args['kor_txt']
    else:
        if request.headers.get('Content-Type').find("application/json") >= 0: #컨텐트 타입 헤더가 aplication/json이면
            email = request.json['email']
            course = request.json['course']
            lang = request.json['lang']
            kor_txt = request.json['kor_txt']
        else: #헤더가 applicaiont/x-www-url-encoded이면: 
            email = request.form['email']
            course = request.form['course']
            lang = request.form['lang']
            kor_txt = request.form['kor_txt']
    LOG("/api/similar-words-kor.api\t%s\t%s\t%s\t%s" % (email, course, lang, kor_txt))
    
    myprogress_tsv = my_course_dir(email,lang,course)+'/myprogress.tsv'
    if not (os.path.exists(myprogress_tsv)):
        result = {'resp': 'Fail', 'message': myprogress_tsv+' not found'}
        resp = make_response(jsonify(result))
        resp.set_cookie('login_status', 'fail')
        return resp	
    f = open(myprogress_tsv, 'r', encoding='utf-8')
    rows = []
    for line in f:
        #  [0]level,[1]esp_txt,[2]kor,[3]eng,[4]group,[5]count,[6]next-review-time
        row = line.strip().split('\t')
        if len(row) < 7:
            continue
        diff_value = get_word_to_word_diff(kor_txt, row[2])
        row = [diff_value] + row
        rows.append(row)
    f.close()
    if len(rows) < 4:
        result = {'resp': 'Fail', 'message': 'too little items in myprogress.tsv'}
        resp = make_response(jsonify(result))
        resp.set_cookie('login_status', 'fail')
        return resp	
    #  [0]diff_value, [1]level,[2]esp_txt,[3]kor,[4]eng,[5]group,[6]count,[7]next-review-time
    rows.sort()
    selected = []
    for i, row in enumerate(rows):
        selected.append([row[2], row[3]])
        if i == 3:
            break
    
    result = {'resp': 'OK', 'selected': selected}
    resp = make_response(jsonify(result))
    return resp


@app.route('/api/similar-words.api', methods=['POST', 'GET'])
def similar_words():
    if request.method == 'GET':
        email = request.args['email']
        course = request.args['course']
        lang = request.args['lang']
        esp_txt = request.args['esp_txt']
    else:
        if request.headers.get('Content-Type').find("application/json") >= 0: #컨텐트 타입 헤더가 aplication/json이면
            email = request.json['email']
            course = request.json['course']
            lang = request.json['lang']
            esp_txt = request.json['esp_txt']
        else: #헤더가 applicaiont/x-www-url-encoded이면: 
            email = request.form['email']
            course = request.form['course']
            lang = request.form['lang']
            esp_txt = request.form['esp_txt']
    LOG("/api/similar-words.api\t%s\t%s\t%s\t%s" % (email, course, lang, esp_txt))

    
    myprogress_tsv = my_course_dir(email,lang,course)+'/myprogress.tsv'
    if not (os.path.exists(myprogress_tsv)):
        result = {'resp': 'Fail', 'message': myprogress_tsv+' not found'}
        resp = make_response(jsonify(result))
        resp.set_cookie('login_status', 'fail')
        return resp	
    f = open(myprogress_tsv, 'r', encoding='utf-8')
    rows = []
    for line in f:
        #  [0]level,[1]esp_txt,[2]kor,[3]eng,[4]group,[5]count,[6]next-review-time
        row = line.strip().split('\t')
        if len(row) < 7:
            continue
        diff_value = get_word_to_word_diff(esp_txt, row[1])
        row = [diff_value] + row
        rows.append(row)
    f.close()
    if len(rows) < 4:
        result = {'resp': 'Fail', 'message': 'too little items in myprogress.tsv'}
        resp = make_response(jsonify(result))
        resp.set_cookie('login_status', 'fail')
        return resp	
    #  [0]diff_value, [1]level,[2]esp_txt,[3]kor,[4]eng,[5]group,[6]count,[7]next-review-time
    rows.sort()
    selected = []
    for i, row in enumerate(rows):
        selected.append([row[2], row[3]])
        if i == 3:
            break
    
    result = {'resp': 'OK', 'selected': selected}
    resp = make_response(jsonify(result))
    return resp

@app.route('/api/similar-words-jk.api', methods=['POST', 'GET'])
def similar_words_jk():
    if request.method == 'GET':
        email = request.args['email']
        course = request.args['course']
        lang = request.args['lang']
        j_word = request.args['j_word']
        k_word = request.args['k_word']
    else:
        if request.headers.get('Content-Type').find("application/json") >= 0: #컨텐트 타입 헤더가 aplication/json이면
            email = request.json['email']
            course = request.json['course']
            lang = request.json['lang']
            j_word = request.json['j_word']
            k_word = request.json['k_word']
        else: #헤더가 applicaiont/x-www-url-encoded이면: 
            email = request.form['email']
            course = request.form['course']
            lang = request.form['lang']
            j_word = request.form['j_word']
            k_word = request.form['k_word']
    LOG("/api/similar-words-jk.api\t%s\t%s\t%s\t%s\t%s" % (email, course, lang, j_word, k_word))

    
    myprogress_tsv = my_course_dir(email,lang,course)+'/myprogress.tsv'
    if not (os.path.exists(myprogress_tsv)):
        result = {'resp': 'Fail', 'message': myprogress_tsv+' not found'}
        resp = make_response(jsonify(result))
        resp.set_cookie('login_status', 'fail')
        return resp	
    
    # esp_txt 컬럼에 들어 있는 속의 개별 단어들에 대해들에 대해서 j_word와 k_word간의 거리 값을
    # similiar_words 딕셔너리에 기억시킨다.
    f = open(myprogress_tsv, 'r', encoding='utf-8')
    similar_words = {}
    for line in f:
        #  [0]level,[1]esp_txt,[2]kor,[3]eng,[4]group,[5]count,[6]next-review-time
        row = line.strip().split('\t')
        if len(row) < 7:
            continue
        esp_txt = row[1]
        esp_txt = esp_txt.replace(',', ' , ')
        esp_txt = esp_txt.replace('?', ' ? ')
        esp_txt = esp_txt.replace('.', ' . ')
        esp_txt = esp_txt.replace('~', ' ~ ')
        esp_txt = esp_txt.replace('!', ' ! ')
        esp_txt = esp_txt.replace('(', ' ( ')
        esp_txt = esp_txt.replace(')', ' ) ')
        esp_txt = esp_txt.replace('"', ' " ')
        esp_txt = esp_txt.replace('”', ' ” ')
        esp_txt = esp_txt.replace('=', ' = ')
        esp_txt = esp_txt.replace('「', ' 「 ')
        esp_txt = esp_txt.replace('」', ' 」 ')
        words = esp_txt.strip().split(' ')
        for word in words:
            if word in [',', '?', '.', '~', '!', "(", ")", '"', '”', '=', '「', '」', '']:
                continue
            if not word in similar_words:
                diff_value_j = get_word_to_word_diff(word, j_word)
                diff_value_k = get_word_to_word_diff(word, k_word)
                similar_words[word] = diff_value_j
                if diff_value_k < diff_value_j:
                    similar_words[word] = diff_value_k
    f.close()

    if len(similar_words) < 4:
        result = {'resp': 'Fail', 'message': 'too little items in myprogress.tsv'}
        resp = make_response(jsonify(result))
        resp.set_cookie('login_status', 'fail')
        return resp	
    
    # similar_words의 dictionary 내용을 diff value값 순서대로 sorting한다.
    lines = []
    for word in similar_words:
        line = "%0.3f %s" % (similar_words[word], word)
        lines.append(line)
    lines.sort()
    
    # sorting된 단어들 중에 diff value 최소값 6개인 단어들을 선택한다.
    selected = []
    for i, line in enumerate(lines):
        (diff_value, word) = line.split(' ')
        selected.append(word)
        if i == 6:
            break
    
    result = {'resp': 'OK', 'selected': selected}
    resp = make_response(jsonify(result))
    return resp

@app.route('/api/put-score.api', methods=['POST', 'GET'])
def put_score():
    if request.method == 'GET':
        email = request.args['email']
        course = request.args['course']
        lang = request.args['lang']
        esp_txt = request.args['esp_txt']
        score = request.args['score']
    else:
        if request.headers.get('Content-Type').find("application/json") >= 0: #컨텐트 타입 헤더가 aplication/json이면
            email = request.json['email']
            course = request.json['course']
            lang = request.json['lang']
            esp_txt = request.json['esp_txt']
            score = request.json['score']
        else: #헤더가 applicaiont/x-www-url-encoded이면: 
            email = request.form['email']
            course = request.form['course']
            lang = request.form['lang']
            esp_txt = request.form['esp_txt']
            score = request.form['score']
    LOG("/api/put-score.api\t%s\t%s\t%s\t%s\t%s" % (email, course, lang, esp_txt, score))

    #myprogress_tsv파일이 존재하지 않으면 error를 리턴하고 로그아웃 시킨다. 
    myprogress_tsv = my_course_dir(email,lang,course)+'/myprogress.tsv'
    if not (os.path.exists(myprogress_tsv)):
        result = {'resp': 'Fail', 'message': myprogress_tsv+' not found'}
        resp = make_response(jsonify(result))
        resp.set_cookie('login_status', 'fail')
        return resp	
    
    #myprogress 파일을 읽어서 해당 esp_txt 항목에 대한 count 값과 next-review-time을 업데이트 해준다.
    f = open(myprogress_tsv, 'rb+')
    fcntl.flock(f, fcntl.LOCK_EX)
    data = f.read()
    data_lines = data.split(b"\n")
    # lines = []
    prev_pos = 0
    for data_line in data_lines:
        line = data_line.decode("utf-8")
        #  [0]level,[1]esp_txt,[2]kor,[3]eng,[4]group,[5]count,[6]next-review-time
        row = line.strip().split('\t')
        if len(row) < 7: #잘못 된 라인은 무시한다.
            continue
        if row[1] == esp_txt:
            #사용자가 보내온 스코어 값과 이 아이템의 카운트에 따라서 다음에 리뷰할 시간을 결정해서 적어 놓는다.
            (next_count, next_review_str) = next_review_time(int(row[5].strip()), int(score)) 
            row[5] = "%-5d" % (next_count + 1)
            row[6] = next_review_str
            line = "\t".join(row)+'\n'
            f.seek(prev_pos, 0)
            f.write(line.encode("utf-8"))
            break
        # lines.append(line)
        prev_pos += len(data_line) + 1
    fcntl.flock(f, fcntl.LOCK_UN)
    f.close()

    # f = open(myprogress_tsv, 'w', encoding='utf-8')
    # f.write("".join(lines))
    # f.close()

    result = {'resp': 'OK', 'message': 'score sucessfully updated'}
    resp = make_response(jsonify(result))
    return resp

def calc_progress(rows):
    score = 0.0
    for row in rows:
        cnt = int(row[5])
        if cnt >= 4: score += 1.0
        elif cnt >= 3: score += 0.5
        elif cnt >= 1: score += 0.3
        elif cnt > 0: score += 0.1
    # print("rows=%d" % len(rows))
    return (score / len(rows))*100.0
    
next_time = [2*60, 20*60, 12*60*60, 2*24*60*60, 10*24*60*60, 20*24*60*60, 60*24*60*60, 180*24*60*60, 720*24*60*60]

def do_one_card(rows, t):
    global next_time
    for i, row in enumerate(rows):
        cnt = int(row[5])
        if cnt == 0:
            rows[i][5] = 1
            rows[i][6] = t + 2*60
            return
        if row[6] < t:
            rows[i][5] = cnt + 1
            if cnt >= len(next_time):
                rows[i][6] = t + next_time[len(next_time) - 1]
            else:
                rows[i][6] = t + next_time[cnt]
            return
    
def do_daily_routine(rows, days):
    t0 = time.time()+(days*24*60*60)
    for i in range(50):
        do_one_card(rows, t0+i*60)
        
def do_simulation(lines, percent):  
    rows = []
    for line in lines:
        row = line.strip().split("\t")
        if len(row) < 7: continue
        # row[5] = int(row[5].strip())
        # if row[6] == "0000-00-00 00:00:00":
        #     row[6] = 0
        # else:
        #     row[6] = time.time()
        row[5] = 0
        row[6] = 0
        rows.append(row)
        # print(row[6])
        
    days = 0
    while True:
        progress = calc_progress(rows)
        # print(progress)
        if progress >= percent:
            break
        do_daily_routine(rows, days)
        days += 1
    # print("-------------------------")
    for i, row in enumerate(rows):
        rows[i][5] = "%-5d" % row[5]
        # print(row[6])
        if rows[i][6] == 0:
            rows[i][6] = "0000-00-00 00:00:00"
        else:
            rows[i][6] = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(row[6]-days*24*60*60))
        
    lines = []
    for row in rows:
        lines.append("\t".join(row))

    return lines

@app.route('/api/jump-level.api', methods=['POST', 'GET'])
def jump_level():
    print("api/jump-level.api")
    if request.method == 'GET':
        email = request.args['email']
        course = request.args['course']
        lang = request.args['lang']
        level = request.args['level']
    else:
        if request.headers.get('Content-Type').find("application/json") >= 0: #컨텐트 타입 헤더가 aplication/json이면
            email = request.json['email']
            course = request.json['course']
            lang = request.json['lang']
            level = request.json['level']
        else: #헤더가 applicaiont/x-www-url-encoded이면: 
            email = request.form['email']
            course = request.form['course']
            lang = request.form['lang']
            level = request.form['level']
    LOG("/api/jump-level.api\t%s\t%s\t%s\t%s" % (email, course, lang, level))

    #myprogress_tsv파일이 존재하지 않으면 error를 리턴하고 로그아웃 시킨다. 
    myprogress_tsv = my_course_dir(email,lang,course)+'/myprogress.tsv'
    if not (os.path.exists(myprogress_tsv)):
        result = {'resp': 'Fail', 'message': myprogress_tsv+' not found'}
        resp = make_response(jsonify(result))
        resp.set_cookie('login_status', 'fail')
        return resp	
    
    #myprogress 파일을 읽어서 해당 esp_txt 항목에 대한 count 값과 next-review-time을 업데이트 해준다.
    f = open(myprogress_tsv, 'r')
    lines = []
    for line in f:
        lines.append(line.strip())
    f.close()

    lines = do_simulation(lines, int(level))

    f = open(myprogress_tsv, 'w')
    fcntl.flock(f, fcntl.LOCK_EX)
    f.write("\n".join(lines))
    # print("\n".join(lines))
    fcntl.flock(f, fcntl.LOCK_UN)
    f.close()

    result = {'resp': 'OK', 'message': 'myprogress.tsv successfully updated'}
    resp = make_response(jsonify(result))
    return resp


@app.route('/api/put-score-kor.api', methods=['POST', 'GET'])
def put_score_kor():
    if request.method == 'GET':
        email = request.args['email']
        course = request.args['course']
        lang = request.args['lang']
        kor_txt = request.args['kor_txt']
        score = request.args['score']
    else:
        if request.headers.get('Content-Type').find("application/json") >= 0: #컨텐트 타입 헤더가 aplication/json이면
            email = request.json['email']
            course = request.json['course']
            lang = request.json['lang']
            kor_txt = request.json['kor_txt']
            score = request.json['score']
        else: #헤더가 applicaiont/x-www-url-encoded이면: 
            email = request.form['email']
            course = request.form['course']
            lang = request.form['lang']
            kor_txt = request.form['kor_txt']
            score = request.form['score']
    LOG("/api/put-score-kor.api\t%s\t%s\t%s\t%s\t%s" % (email, course, lang, kor_txt, score))

    #myprogress_tsv파일이 존재하지 않으면 error를 리턴하고 로그아웃 시킨다. 
    myprogress_tsv = my_course_dir(email,lang,course)+'/myprogress.tsv'
    if not (os.path.exists(myprogress_tsv)):
        result = {'resp': 'Fail', 'message': myprogress_tsv+' not found'}
        resp = make_response(jsonify(result))
        resp.set_cookie('login_status', 'fail')
        return resp	
    
    #myprogress 파일을 읽어서 해당 esp_txt 항목에 대한 count 값과 next-review-time을 업데이트 해준다.
    f = open(myprogress_tsv, 'rb+')
    fcntl.flock(f, fcntl.LOCK_EX)
    data = f.read()
    data_lines = data.split(b"\n")
    # lines = []
    prev_pos = 0
    for data_line in data_lines:
        line = data_line.decode("utf-8")
        #  [0]level,[1]esp_txt,[2]kor,[3]eng,[4]group,[5]count,[6]next-review-time
        row = line.strip().split('\t')
        if len(row) < 7: #잘못 된 라인은 무시한다.
            continue
        if row[2] == kor_txt:
            #사용자가 보내온 스코어 값과 이 아이템의 카운트에 따라서 다음에 리뷰할 시간을 결정해서 적어 놓는다.
            (next_count, next_review_str) = next_review_time(int(row[5].strip()), int(score)) 
            row[5] = "%-5d" % (next_count + 1)
            row[6] = next_review_str
            line = "\t".join(row)+'\n'
            f.seek(prev_pos, 0)
            f.write(line.encode("utf-8"))
            break
        prev_pos += len(data_line) + 1
        # lines.append(line)
    fcntl.flock(f, fcntl.LOCK_UN)
    f.close()

    # f = open(myprogress_tsv, 'w', encoding='utf-8')
    # f.write("".join(lines))
    # f.close()

    result = {'resp': 'OK', 'message': 'score sucessfully updated'}
    resp = make_response(jsonify(result))
    return resp

def files_in(target_dir):
    return [f.name for f in os.scandir(target_dir) if f.is_file()]

def get_users_stats():
    #2023-08-31 16:23:12	/api/login.api	a@a.com	a@a.com	vi-vn
    #2023-08-31 16:24:09	/api/session-start.api	a@a.com	vi-vn	A
    #2023-08-27 16:52:44	/api/session-finish.api	a@a.com	ja-jp	C
    date_from = time.strftime("%Y-%m-%d.log", time.localtime(time.time()-7*24*60*60))
    date_to = time.strftime("%Y-%m-%d.log", time.localtime(time.time()))
    log_files = files_in("./logs")
    stat = {}
    for log_file in log_files:
        if log_file >= date_from:
            print(log_file)
            fp = open("./logs/" + log_file)
            for line in fp:
                row = line.strip().split("\t")
                if row[1] == "/api/login.api":
                    if not "login" in stat:
                        stat["login"] = {}
                        stat["login"]["count"] = 0
                    stat["login"]["count"] += 1
                    if not row[4] in stat["login"]:
                        stat["login"][row[4]] = {}
                    # stat["login"][row[4]][row[2]] = row[0]
                    if row[2] in stat["login"][row[4]]:
                        stat["login"][row[4]][row[2]] += 1
                    else:
                        stat["login"][row[4]][row[2]] = 1
                if row[1] == "/api/session-start.api":
                    if not "sessionstart" in stat:
                        stat["sessionstart"] = {}
                        stat["sessionstart"]["count"] = 0
                    stat["sessionstart"]["count"] += 1
                    if not row[3]+"."+row[4] in stat["sessionstart"]:
                        stat["sessionstart"][row[3]+"."+row[4]] = {}
                    # stat["sessionstart"][row[3]+"."+row[4]][row[2]] = row[0]
                    if row[2] in stat["sessionstart"][row[3]+"."+row[4]]:
                        stat["sessionstart"][row[3]+"."+row[4]][row[2]] += 1
                    else:
                        stat["sessionstart"][row[3]+"."+row[4]][row[2]] = 1
                if row[1] == "/api/session-finish.api":
                    if not "sessionfinish" in stat:
                        stat["sessionfinish"] = {}
                        stat["sessionfinish"]["count"] = 0
                    stat["sessionfinish"]["count"] += 1
                    if not row[3]+"."+row[4] in stat["sessionfinish"]:
                        stat["sessionfinish"][row[3]+"."+row[4]] = {}
                    # stat["sessionfinish"][row[3]+"."+row[4]][row[2]] = row[0]
                    if row[2] in stat["sessionfinish"][row[3]+"."+row[4]]:
                        stat["sessionfinish"][row[3]+"."+row[4]][row[2]] += 1
                    else:
                        stat["sessionfinish"][row[3]+"."+row[4]][row[2]] = 1
            fp.close()

    return stat


@app.route('/api/users_stats.api', methods=['POST'])
def users_stats():
    #wordlist = request.json['wordlist']
    stats = get_users_stats()
    result = {'stats': stats}
    resp = make_response(jsonify(result))
    return resp

@app.route('/tts/get_voices.api', methods=['POST'])
def get_voices():
    wordlist = request.json['wordlist']

    word_voice_pairs = []
    voices = ["male1", "male2", "female1",
              "female2", "ludoviko"]

    for word in wordlist:
        word = word.strip()
        voice_list = ""
        for voice in voices:
            if os.path.exists("./sounds/"+voice+"/"+word+".mp3"):
                last_modified_time = os.path.getmtime("./sounds/"+voice+"/"+word+".mp3")
                if time.time() - last_modified_time < 24*60*60:
                    voice_list += voice + "new,"
                else:
                    voice_list += voice + ","
        word_voice_pair = [word, voice_list]
        word_voice_pairs.append(word_voice_pair)

    result = {'word_voice_pairs': word_voice_pairs}

    resp = make_response(jsonify(result))
    return resp

@app.route('/tts/del_voice.api', methods=['POST'])
def del_voice():
    # cmd = request.json['cmd']
    esp_txt = request.json['esp_txt']
    voice = request.json['voice']

    os.remove("./sounds/"+voice+"/"+esp_txt+".mp3")

    result = {'OK': 'deleted'}

    resp = make_response(jsonify(result))
    return resp

def read_conf():
    svc = {}
    fp = open("svc.conf", "r")
    for line in fp:
        if line[0] == "#":
            continue
        row = line.strip().split("=")
        if len(row) != 2:
            continue
        svc[row[0].strip()] = row[1].strip()
    fp.close()
    return svc

svc_conf = read_conf()

app.run(debug=True, host=svc_conf["IP"], port=int(svc_conf["PORT"]))
#IP=192.168.117.129
#PORT=5002

