from flask import Flask, send_from_directory, request, make_response, jsonify
import os, re, json, datetime, random, time 

app = Flask(__name__)

# PAGES 파일 서비스
@app.route('/pages/<path:path>')
def serve_pages(path):
    return send_from_directory('pages', path)

@app.route('/sounds/<path:path>')
def serve_sounds(path):
    return send_from_directory('sounds', path)

def is_valid_email(email):
    # 이메일 주소에 대한 정규 표현식(Regular Expression)
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def my_course_dir(email, lang, course):
    return os.path.join("./users", email[0], email,'courses', lang, course)

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
            row = line.strip().split('\t')
            if len(row) <7:
                continue
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
            row = line.strip().split('\t')
            if len(row) < 7:
                continue
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


@app.route('/api/logout.api', methods=['POST'])
def logout():
    #TODO 쿠키 로그아웃 처리
    # if not login:
    # result = {'resp': 'Fail', 'message': 'You are not logged in'}
    # resp = make_response(jsonify(result))
    # resp.set_cookie('login_status', 'loged_out')
    # return resp 
    result = {'resp': 'OK', 'user': ''}
    resp = make_response(jsonify(result))
    resp.set_cookie('login_status', 'loged_out')
    return resp


@app.route('/api/card-next-old.api', methods=['POST', 'GET'])
def next_card_old():
    if request.method == 'GET':
        email = request.args['email']
        course = request.args['course']
        lang = request.args['lang']
    else:
        if request.headers.get('Content-Type').find("application/json") >= 0: #컨텐트 타입 헤더가 aplication/json이면
            email = request.json['email']
            course = request.json['course']
            lang = request.json['lang']
        else: #헤더가 applicaiont/x-www-url-encoded이면: 
            email = request.form['email']
            course = request.form['course']
            lang = request.form['lang']
    #TODO
    # 로그인 여부를 cookie:login_status를 이용해서 체크하고 필요하면 reject한다.
    #if not login:
    # result = {'resp': 'Fail', 'message': 'You are not logged in'}
    # resp = make_response(jsonify(result))
    # resp.set_cookie('login_status', 'loged_out')
    # return resp   
# userid, email, cookie:login_status, lang, course
#     //         output: 
#     //                quiz-card-url, 퀴즈 카드 유형을 랜덤으로 정해서 보내옴
#     //                level,esp_text,kor,eng,group,count,next-review-time, = myprgress.tsv파일의 한 라인임
    myprogress_tsv = my_course_dir(email,lang,course)+'/myprogress.tsv'
    next_row = []
    nowstr = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time.time()))
    
    f = open(myprogress_tsv, 'r')
    for i, line in enumerate(f):
        #  [0]level,[1]esp_text,[2]kor,[3]eng,[4]group,[5]count,[6]next-review-time
        row = line.strip().split('\t')
        if len(row) < 7:
            continue
        if row[6] == '-':
            next_row = row
            break
        if row[6] <= nowstr:
            next_row = row
            break
    f.close()

    if len(next_row) < 7:
        result = {'resp': 'Fail', 'message': 'Cannot find oldest row'}
        resp = make_response(jsonify(result))
        resp.set_cookie('login_status', 'loged_out')
        return resp

    if next_row[6] == '-':
        quiz_card_url = './quiz-first.html'
    else:
        quizlist = ['quizA','quizB','quizC','quizD','quizE','quizF']
        quiz_card = random.choice(quizlist)
        quiz_card_url = './'+quiz_card+'.html'

    #TODO 현재 음성 파일이 없어서 음성 파일들을 생성해서 저장해 놔야함 
    voicelist = ['male1','male2','male3','female1','female2','female3','ludoviko']
    mp3list = []
    for voice in voicelist:
        mp3_url = '/sounds/'+voice+'/'+next_row[1]+'.mp3'
        print("mp3_url:"+mp3_url) 
        if os.path.exists("."+mp3_url):
            mp3list.append([voice, mp3_url])
    print("mp3list:"+ str(mp3list))
    voice = ""
    mp3_url = ""
    voice_img_url = ""
    if len(mp3list) > 0:
       [voice, mp3_url] = random.choice(mp3list)
       voice_img_url = './img/'+voice+'.png'

    result = {'resp': 'OK', 'level': next_row[0], 'esp_text': next_row[1], 'kor_text': next_row[2], 'eng_text': next_row[3], 'group': next_row[4], 'count':next_row[5], 'next_review_time': next_row[6], 'quiz_card_url':quiz_card_url, 'mp3_url':mp3_url, 'voice_img_url':voice_img_url, 'voice':voice, "quiz_count":0}
    resp = make_response(jsonify(result))
    return resp

def next_review_time(count, score):
    #다음 리뷰 시간 정하는 규칙
    #1. 만약 처음이면(count == 0) +5분 후로 
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

    t0 = time.time()
    if count == 0: next_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(t0 + 5*60))
    if count == 1: next_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(t0 + 20*60))
    if count == 2: next_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(t0 + 5*60*60))
    if count == 3: next_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(t0 + 24*60*60))
    if count == 4: next_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(t0 + 2*24*60*60))
    if count == 5: next_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(t0 + 10*24*60*60))
    if count == 6: next_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(t0 + 20*24*60*60))
    if count == 7: next_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(t0 + 60*24*60*60))
    if count == 8: next_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(t0 + 180*24*60*60))
    if count >= 9: next_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(t0 + 720*24*60*60))

    return (count, next_str)

@app.route('/api/card-next.api', methods=['POST', 'GET'])
def card_next():
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
    
    #TODO
    # 로그인 여부를 cookie:login_status를 이용해서 체크하고 필요하면 reject한다.
    #if not login:
    # result = {'resp': 'Fail', 'message': 'You are not logged in'}
    # resp = make_response(jsonify(result))
    # resp.set_cookie('login_status', 'loged_out')
    # return resp   
    if esp_txt != "":
        myprogress_tsv = my_course_dir(email,lang,course)+'/myprogress.tsv'
        f = open(myprogress_tsv, 'r', encoding='utf-8')
        lines = []
        for i, line in enumerate(f):
            #  [0]level,[1]esp_text,[2]kor,[3]eng,[4]group,[5]count,[6]next-review-time
            row = line.strip().split('\t')
            if len(row) < 7:
                continue
            if row[1] == esp_txt:
                (next_count, next_review_str) = next_review_time(int(row[5]), int(score)) #사용자가 보내온 스코어 값과 이 아이템의 카운트에 따라서 다음에 리뷰할 시간을 결정해서 적어 놓는다.
                row[5] = str(next_count + 1)
                row[6] = next_review_str
            line = "\t".join(row)+'\n'
            lines.append(line)
        f.close()

        f = open(myprogress_tsv, 'w', encoding='utf-8')
        f.write("".join(lines))
        f.close()

    #새로 학습할 카드를 선택해서 사용자에게 리턴한다.
    #     //         output: 
    #     //                quiz-card-url, 퀴즈 카드 유형을 랜덤으로 정해서 보내옴
    #     //                level,esp_text,kor,eng,group,count,next-review-time, = myprgress.tsv파일의 한 라인임
    
    myprogress_tsv = my_course_dir(email,lang,course)+'/myprogress.tsv'
    next_row = []
    nowstr = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time.time()))
    
    f = open(myprogress_tsv, 'r')
    for i, line in enumerate(f):
        #  [0]level,[1]esp_text,[2]kor,[3]eng,[4]group,[5]count,[6]next-review-time
        row = line.strip().split('\t')
        if len(row) < 7:
            continue
        if row[6] == '-':
            next_row = row
            break
        if row[6] <= nowstr:
            next_row = row
            break
    f.close()
    

    if len(next_row) < 7:
        result = {'resp': 'Fail', 'message': 'Cannot find oldest row'}
        resp = make_response(jsonify(result))
        resp.set_cookie('login_status', 'loged_out')
        return resp

    if next_row[6] == '-':
        quiz_card_url = './quiz-first.html'
    else:
        quizlist = ['quizA','quizB','quizC','quizD','quizE','quizF']
        quiz_card = random.choice(quizlist)
        quiz_card_url = './'+quiz_card+'.html'

    #TODO 현재 음성 파일이 없어서 음성 파일들을 생성해서 저장해 놔야함 
    voicelist = ['male1','male2','male3','female1','female2','female3','ludoviko']
    mp3list = []
    for voice in voicelist:
        mp3_url = '/sounds/'+voice+'/'+next_row[1]+'.mp3'
        print("mp3_url:"+mp3_url) 
        if os.path.exists("."+mp3_url):
            mp3list.append([voice, mp3_url])
    print("mp3list:"+ str(mp3list))
    voice = ""
    mp3_url = ""
    voice_img_url = ""
    if len(mp3list) > 0:
       [voice, mp3_url] = random.choice(mp3list)
       voice_img_url = './img/'+voice+'.png'

    result = {'resp': 'OK', 'level': next_row[0], 'esp_text': next_row[1], 'kor_text': next_row[2], 'eng_text': next_row[3], 'group': next_row[4], 'count':next_row[5], 'next_review_time': next_row[6], 'quiz_card_url':quiz_card_url, 'mp3_url':mp3_url, 'voice_img_url':voice_img_url, 'voice':voice}
    resp = make_response(jsonify(result))
    return resp



app.run(debug=True, host='192.168.117.129', port=5002)

