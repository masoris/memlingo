function $(id) {
    return document.getElementById(id);
}

function add_carditem(carditem){
    carditems = [];
    if (localStorage.getItem("Carditems") != null){
        carditems = JSON.parse(localStorage.Carditems);
    }
    carditems.push(carditem);
    localStorage.setItem("Carditems",JSON.stringify(carditems));
}

function click_btn_easy() {
    click_btn_easy_hard("easy")
}

function click_btn_hard() {
    click_btn_easy_hard("hard")
}

function click_btn_easy_hard(easy_or_hard) {
    email = localStorage.email
    lang = localStorage.lang
    course = localStorage.session_course

    carditem = JSON.parse(localStorage.Carditem)
    
    console.log("localStorage.quiz_count:"+localStorage.quiz_count);
    quiz_count = parseInt(localStorage.quiz_count) + 1;
    localStorage.setItem("quiz_count",quiz_count.toString());
    console.log("localStorage.quiz_count2:"+localStorage.quiz_count);
    if ( localStorage.quiz_count > 10){
        window.location.href = "session-finish.html";
        return;
    }

    esp_txt = carditem.esp_txt
    if (easy_or_hard == "easy") {
        score = 1
    }
    else {
        score = -1
    }


    // /api/card-submit.api
    //         userid, email, cookie:login_status, lang, course, esp, score
    //         [level,esp,kor,eng,group,count,repeat_date,img_url,voice_name] //다음 항목
    // /api/card-next.api
    //         userid, email, cookie:login_status, lang, course
    //         output: 
    //                quiz-card-url, 퀴즈 카드 유형을 랜덤으로 정해서 보내옴
    //                level,esp_txt,kor,eng,group,count,next-review-time, = myprgress.tsv파일의 한 라인임
    //                voice_img,voice_name,esp_txt.mp3 = esp_txt를 음성으로 읽어줄 캐릭터와 음성  
    var jsonStr = JSON.stringify({ email: email, lang: lang, course: course, esp_txt: esp_txt, score: score});
    postAjaxRequest('/api/card-next.api', jsonStr, function (responseJSONStr) {
        responseObj = JSON.parse(responseJSONStr);
        console.log(responseObj);
        // 받아온 output을 이용해서 적절하게 한장의 퀴즈 페이지를 구성한다. 
        if (responseObj['resp'] == "OK") {
            add_carditem(responseObj);

            localStorage.setItem("Carditem", responseJSONStr);
            window.location.href = responseObj.quiz_card_url;
        } else {
            alert('Error' + responseJSONStr);
        }

    }, function (status, responseText) {
        alert(responseText);
        console.error('Error:', status);
        console.error(responseText);
    });
}

window.onload = function () {
    if (getCookie('login_status') != 'success') {
        window.location.href = "./login.html";
        return;
    }
    
    carditem = JSON.parse(localStorage.Carditem)

    $('btn_quit').onclick = function () {
        window.location.href = "./user-courses.html";
    }

    $('btn_speaker').onclick = function () {
        var audio = new Audio(carditem.mp3_url);
        audio.addEventListener('ended', function () {
            audio.pause();
            audio.currentTime = 0;
        });
        audio.play();
    }

    $('btn_listen').onclick = function () {
        var audio = new Audio(carditem.mp3_url);
        audio.addEventListener('ended', function () {
            audio.pause();
            audio.currentTime = 0;
        });
        audio.play();
    }

    $('esp_txt').innerText = carditem.esp_txt;
    $('eng_txt').innerText = carditem.eng_txt;
    $('kor_txt').innerText = carditem.kor_txt;

    $('voice_img').src = carditem.voice_img_url;

    $('btn_hard').onclick = click_btn_hard;
    $('btn_easy').onclick = click_btn_easy;





    // alert(carditem.voice_img_url)

    // ABC = localStorage.session_course

    // user_courses = JSON.parse(localStorage.user_courses);
    // if (ABC == 'A') {
    //     $('session_course_name').innerText = user_courses.A.name;
    //     $('session_course_short_description').innerText = user_courses.A.short_description;
    //     $('session_course_familiar').innerText = user_courses.A.familiar;
    //     $('session_course_mastered').innerText = user_courses.A.mastered;
    //     $('session_course_needs_review').innerText = user_courses.A.needs_review;
    //     $('session_course_points').innerText = user_courses.A.points;
    //     $('session_course_progress').innerText = user_courses.A.progress;
    //     $('session_course_total_count').innerText = user_courses.A.total_count;
    // } else if (ABC == 'B') {
    //     $('session_course_name').innerText = user_courses.B.name;
    //     $('session_course_short_description').innerText = user_courses.B.short_description;
    //     $('session_course_familiar').innerText = user_courses.B.familiar;
    //     $('session_course_mastered').innerText = user_courses.B.mastered;
    //     $('session_course_needs_review').innerText = user_courses.B.needs_review;
    //     $('session_course_points').innerText = user_courses.B.points;
    //     $('session_course_progress').innerText = user_courses.B.progress;
    //     $('session_course_total_count').innerText = user_courses.B.total_count;
    // } else {
    //     $('session_course_name').innerText = user_courses.C.name;
    //     $('session_course_short_description').innerText = user_courses.C.short_description;
    //     $('session_course_familiar').innerText = user_courses.C.familiar;
    //     $('session_course_mastered').innerText = user_courses.C.mastered;
    //     $('session_course_needs_review').innerText = user_courses.C.needs_review;
    //     $('session_course_points').innerText = user_courses.C.points;
    //     $('session_course_progress').innerText = user_courses.C.progress;
    //     $('session_course_total_count').innerText = user_courses.C.total_count;
    // }



    // $('Btn_Start_learning').onclick = click_btn_start_learning;


};


