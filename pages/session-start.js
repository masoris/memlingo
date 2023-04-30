function $(id) {
    return document.getElementById(id);
}

function click_btn_start_learning() {
    email = localStorage.email
    lang = localStorage.lang
    course = localStorage.session_course

    // /api/card-next.api
    //         userid, email, cookie:login_status, lang, course
    //         output: 
    //                quiz-card-url, 퀴즈 카드 유형을 랜덤으로 정해서 보내옴
    //                level,esp_text,kor,eng,group,count,next-review-time, = myprgress.tsv파일의 한 라인임
    //                voice_img,voice_name,esp_text.mp3 = esp_txt를 음성으로 읽어줄 캐릭터와 음성  
    var jsonStr = JSON.stringify({ email: email, lang: lang, course: course });
    postAjaxRequest('/api/card-next.api', jsonStr, function (responseJSONStr) {
        alert(responseJSONStr)
        responseObj = JSON.parse(responseJSONStr);

        // 받아온 output을 이용해서 적절하게 한장의 퀴즈 페이지를 구성한다. 
        if (responseObj['resp'] == "OK") {
            //     //'resp': 'OK', 'user': email1[:email1.find('@')], 'email': email1, "lang": lang, "user_courses": user_courses
            //     localStorage.setItem('user', responseObj['user']);
            //     localStorage.setItem('email', responseObj['email']);
            //     localStorage.setItem('lang', responseObj['lang']);
            //     localStorage.setItem('user_courses', JSON.stringify(responseObj['user_courses']));
            //     // alert(getCookie('login_status'));
            //     window.location.href = "./user-courses.html";
        } else {
            alert('Error' + responseJSONStr);
        }
        console.log(responseObj);
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
    ABC = localStorage.session_course

    user_courses = JSON.parse(localStorage.user_courses);
    if (ABC == 'A') {
        $('session_course_name').innerText = user_courses.A.name;
        $('session_course_short_description').innerText = user_courses.A.short_description;
        $('session_course_familiar').innerText = user_courses.A.familiar;
        $('session_course_mastered').innerText = user_courses.A.mastered;
        $('session_course_needs_review').innerText = user_courses.A.needs_review;
        $('session_course_points').innerText = user_courses.A.points;
        $('session_course_progress').innerText = user_courses.A.progress;
        $('session_course_total_count').innerText = user_courses.A.total_count;
    } else if (ABC == 'B') {
        $('session_course_name').innerText = user_courses.B.name;
        $('session_course_short_description').innerText = user_courses.B.short_description;
        $('session_course_familiar').innerText = user_courses.B.familiar;
        $('session_course_mastered').innerText = user_courses.B.mastered;
        $('session_course_needs_review').innerText = user_courses.B.needs_review;
        $('session_course_points').innerText = user_courses.B.points;
        $('session_course_progress').innerText = user_courses.B.progress;
        $('session_course_total_count').innerText = user_courses.B.total_count;
    } else {
        $('session_course_name').innerText = user_courses.C.name;
        $('session_course_short_description').innerText = user_courses.C.short_description;
        $('session_course_familiar').innerText = user_courses.C.familiar;
        $('session_course_mastered').innerText = user_courses.C.mastered;
        $('session_course_needs_review').innerText = user_courses.C.needs_review;
        $('session_course_points').innerText = user_courses.C.points;
        $('session_course_progress').innerText = user_courses.C.progress;
        $('session_course_total_count').innerText = user_courses.C.total_count;
    }

    $('back_to_user_courses').onclick = function () {
        window.location.href = "./user-courses.html";
    }

    $('Btn_Start_learning').onclick = click_btn_start_learning;


};
