function $(id) {
    return document.getElementById(id);
}

function call_session_start_api() {
    email = localStorage.email
    lang = localStorage.lang
    course = localStorage.session_course

    var jsonStr = JSON.stringify({ email: email, lang: lang, course: course });
    postAjaxRequest('/api/session-start.api', jsonStr, function (responseJSONStr) {
        responseObj = JSON.parse(responseJSONStr);
        console.log(responseObj);

    }, function (status, responseText) {
        alert(responseText);
        console.error('Error:', status);
        console.error(responseText);
    });
}

function click_btn_start_learning() {
    call_session_start_api(); //session_start 로그를 남긴다.

    email = localStorage.email
    lang = localStorage.lang
    course = localStorage.session_course
    localStorage.setItem("Carditems", "[]");

    // /api/card-next.api
    //         userid, email, cookie:login_status, lang, course
    //         output: 
    //                quiz-card-url, 퀴즈 카드 유형을 랜덤으로 정해서 보내옴
    //                level,esp_text,kor,eng,group,count,next-review-time, = myprgress.tsv파일의 한 라인임
    //                voice_img,voice_name,esp_text.mp3 = esp_txt를 음성으로 읽어줄 캐릭터와 음성  
    var jsonStr = JSON.stringify({ email: email, lang: lang, course: course, esp_txt: "", score: "" });
    postAjaxRequest('/api/card-next.api', jsonStr, function (responseJSONStr) {
        responseObj = JSON.parse(responseJSONStr);
        console.log(responseObj);
        // 받아온 output을 이용해서 적절하게 한장의 퀴즈 페이지를 구성한다. 
        if (responseObj['resp'] == "OK") {
            if (localStorage.getItem("Carditems") == null) {
                carditems = [];
                carditems.push(responseObj);
                localStorage.setItem("Carditems", JSON.stringify(carditems));
            }
            else {
                carditems = JSON.parse(localStorage.Carditems);
                carditems.push(responseObj);
                localStorage.setItem("Carditems", JSON.stringify(carditems));
            }
            localStorage.setItem("Carditem", responseJSONStr)
            localStorage.setItem("quiz_count", "0")
            window.location.href = responseObj.quiz_card_url;
        } else {
            alert('Error' + responseJSONStr);
        }

    }, function (status, responseText) {
        alert(responseText + "\nstatus:" + status);
        console.error('Error:', status);
        console.error(responseText);
    });
}

function update_course_info() {
    user_courses = JSON.parse(localStorage.user_courses);
    ABC = localStorage.session_course;
    $('session_course_name').innerText = user_courses[ABC].name;
    $('session_course_short_description').innerHTML = user_courses[ABC].short_description;
    $('session_course_description').innerHTML = user_courses[ABC].description;
    $('session_course_familiar').innerText = user_courses[ABC].familiar;
    $('session_course_mastered').innerText = user_courses[ABC].mastered;
    $('session_course_needs_review').innerText = user_courses[ABC].needs_review;
    $('session_course_points').innerText = user_courses[ABC].points;
    $('session_course_progress').innerText = user_courses[ABC].progress;
    $('session_course_total_count').innerText = user_courses[ABC].total_count;

}

window.onload = function () {
    if (localStorage.getItem('login_status') != 'success') {
        window.location.href = "./login.html";
        return;
    }
    display_message();
    // display_language_str();

    get_course_info(update_course_info);

    $('back_to_user_courses').onclick = function () {
        window.location.href = "./user-courses.html";
    }

    $('Btn_Start_learning').onclick = click_btn_start_learning;

};

