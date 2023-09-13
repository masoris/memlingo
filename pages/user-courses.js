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
    if (user_courses.A == null) {
        alert("user_courses not available");
        return
    }
    $('Course_table').innerHTML = "";
    for (var X in user_courses) {
        var course_table_X = course_table.replace(/\$A/g, X);
        $('Course_table').innerHTML += "<tr><td>" + course_table_X + "</td></tr>";
        $('Course' + X + '_name').innerText = user_courses[X].name;
        $('Course' + X + '_short_description').innerText = user_courses[X].short_description;
        $('Course' + X + '_familiar').innerText = user_courses[X].familiar;
        $('Course' + X + '_mastered').innerText = user_courses[X].mastered;
        $('Course' + X + '_needs_review').innerText = user_courses[X].needs_review;
        $('Course' + X + '_points').innerText = user_courses[X].points;
        $('Course' + X + '_progress').innerText = user_courses[X].progress;
        $('Course' + X + '_total_count').innerText = user_courses[X].total_count;
        console.log(X);
    }
    for (var X in user_courses) {
        console.log(X);
        var btn_ID = 'Btn_Start' + X;
        console.log(btn_ID);
        $(btn_ID).onclick = function () {
            var btn_ID = this.id;
            localStorage.setItem('session_course', btn_ID.charAt(btn_ID.length - 1));
            // alert(X);
            window.location.href = "./session-start.html";
        }
        // alert($('Btn_Start' + X));
    }

}

function lang_changed() {
    var selected_lang = document.querySelector('input[name="lang"]:checked').value;
    localStorage.lang = selected_lang;
    display_message();
    get_course_info(update_course_info);
}

// function display_message() {
//     if ($('lang').value == 'ko-kr') {
//         $('span_learn_by_examples').innerText = "예제를 통한 에스페란토 학습";
//     }
//     else {
//         $('span_learn_by_examples').innerText = "Learn Esperanto by Examples";
//     }
// }

window.onload = function () {
    if (localStorage.getItem('login_status') != 'success') {
        window.location.href = "./login.html";
        return;
    }

    // display_language_str();

    get_course_info(update_course_info);

    $('Btn_logout').onclick = onlogout_click;
    // $('Btn_StartA').onclick = function () {
    //     localStorage.setItem('session_course', "A");
    //     window.location.href = "./session-start.html";
    // }
    // $('Btn_StartB').onclick = function () {
    //     localStorage.setItem('session_course', "B");
    //     window.location.href = "./session-start.html";
    // }
    // $('Btn_StartC').onclick = function () {
    //     localStorage.setItem('session_course', "C");
    //     window.location.href = "./session-start.html";
    // }

    $("radio-ko-kr").onclick = lang_changed;
    $("radio-en-us").onclick = lang_changed;
    $("radio-ja-jp").onclick = lang_changed;
    $("radio-zh-cn").onclick = lang_changed;
    $("radio-zh-tw").onclick = lang_changed;
    $("radio-vi-vn").onclick = lang_changed;


    if (localStorage.getItem('lang') != null) {
        var lang = localStorage.getItem('lang');
        $("radio-" + lang).checked = true;

        // $('lang').value = localStorage.getItem('lang');

    } else {
        $("radio-ko-kr").checked = true;

        // $('lang').value = 'ko-kr';
    }

    // if (localStorage.getItem("lang") == null) {
    //     localStorage.setItem("lang") = "ko-kr";
    // }
    // $("lang").value = localStorage.lang;

    // $('lang').onchange = function () {
    //     localStorage.lang = $('lang').value;
    //     display_message();
    // }

    display_message();
};

