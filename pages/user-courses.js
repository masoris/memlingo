function onlogout_click() {
    email = localStorage.email;
    lang = localStorage.lang;
    if (localStorage.getItem("session_course") == "") {
        course = "";
    } else {
        course = localStorage.session_course;
    }

    var jsonStr = JSON.stringify({ email: email, lang: lang, course: course });
    postAjaxRequest('/api/logout.api', jsonStr, function (response) {
        //여기서 암묵적으로 쿠키가 들어옴 
        if (getCookie('login_status') != 'success') {
            //alert('Logout action is sucessfuly done');
        }
        localStorage.setItem('user_courses', '');
        window.location.href = "./login.html";
        console.log(response);
    }, function (status) {
        setCookie('login_status', 'loged_out');
        setCookie('user', '');
        localStorage.setItem('user_courses', '');
        window.location.href = "./login.html";
        console.error('Error:', status);
    });
}

// function saluton_click() {
//   const audio = new Audio('./saluton.wav');
//   audio.play();
//   // 버튼을 diable 시킨다 
//   $('btn_saluton').disabled = true;
//   audio.addEventListener('ended', function () {
//     // 버튼을 enable 시킨다 
//     $('btn_saluton').disabled = false;
//   });
// }

function update_course_info() {
    user_courses = JSON.parse(localStorage.user_courses);
    $('CourseA_name').innerText = user_courses.A.name;
    $('CourseA_short_description').innerText = user_courses.A.short_description;
    $('CourseA_familiar').innerText = user_courses.A.familiar;
    $('CourseA_mastered').innerText = user_courses.A.mastered;
    $('CourseA_needs_review').innerText = user_courses.A.needs_review;
    $('CourseA_points').innerText = user_courses.A.points;
    $('CourseA_progress').innerText = user_courses.A.progress;
    $('CourseA_total_count').innerText = user_courses.A.total_count;

    $('CourseB_name').innerText = user_courses.B.name;
    $('CourseB_short_description').innerText = user_courses.B.short_description;
    $('CourseB_familiar').innerText = user_courses.B.familiar;
    $('CourseB_mastered').innerText = user_courses.B.mastered;
    $('CourseB_needs_review').innerText = user_courses.B.needs_review;
    $('CourseB_points').innerText = user_courses.B.points;
    $('CourseB_progress').innerText = user_courses.B.progress;
    $('CourseB_total_count').innerText = user_courses.B.total_count;

    $('CourseC_name').innerText = user_courses.C.name;
    $('CourseC_short_description').innerText = user_courses.C.short_description;
    $('CourseC_familiar').innerText = user_courses.C.familiar;
    $('CourseC_mastered').innerText = user_courses.C.mastered;
    $('CourseC_needs_review').innerText = user_courses.C.needs_review;
    $('CourseC_points').innerText = user_courses.C.points;
    $('CourseC_progress').innerText = user_courses.C.progress;
    $('CourseC_total_count').innerText = user_courses.C.total_count;

}

function display_message() {
    if ($('lang').value == 'ko-kr') {
        $('span_learn_by_examples').innerText = "예제를 통한 에스페란토 학습";
    }
    else {
        $('span_learn_by_examples').innerText = "Learn Esperanto by Examples";
    }
}

window.onload = function () {
    if (getCookie('login_status') != 'success') {
        window.location.href = "./login.html";
        return;
    }

    display_language_str();

    get_course_info(update_course_info);

    $('Btn_logout').onclick = onlogout_click;
    $('Btn_StartA').onclick = function () {
        localStorage.setItem('session_course', "A");
        window.location.href = "./session-start.html";
    }
    $('Btn_StartB').onclick = function () {
        localStorage.setItem('session_course', "B");
        window.location.href = "./session-start.html";
    }
    $('Btn_StartC').onclick = function () {
        localStorage.setItem('session_course', "C");
        window.location.href = "./session-start.html";
    }

    $('lang').onchange = function () {
        display_message();
    }
    display_message();
};

