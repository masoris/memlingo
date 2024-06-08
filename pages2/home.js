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


function update_course_info() {
    // alert("update_course_info");
    user_courses = JSON.parse(localStorage.user_courses);
    lang = localStorage.lang;
    if (user_courses.A == null) {
        alert("user_courses not available");
        return
    }
    $('Course_table').innerHTML = "";
    for (var X in user_courses) {
        var course_table_X = course_table.replace(/\$A/g, X);
        $('Course_table').innerHTML += "<tr><td>" + course_table_X + "</td></tr>";
        $('Course' + X + '_name').innerText = user_courses[X].name;
        $('Course' + X + '_short_description').innerHTML = user_courses[X].short_description;
        $('Course' + X + '_familiar').innerText = user_courses[X].familiar;
        $('Course' + X + '_mastered').innerText = user_courses[X].mastered;
        // $('Course' + X + '_needs_review').innerText = user_courses[X].needs_review;
        $('Course' + X + '_points').innerText = user_courses[X].points;
        $('Course' + X + '_progress').innerText = user_courses[X].progress;
        $('Course' + X + '_total_count').innerText = user_courses[X].total_count;
        console.log(X);
    }
    $("Course_table").innerHTML += "<tr><td>" + course_table_Z + "</td></tr>";
    if (lang == "ko-kr") {
        $("Course_table").innerHTML += "<tr><td>" + course_table_HD + "</td></tr>";
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

    $('Btn_Start_Z').onclick = Zagreba_click;
    if (lang == "ko-kr") {
        $('Btn_Start_HD1').onclick = HD1_click;
        $('Btn_Start_HD2').onclick = HD2_click;
        $('Btn_Start_HD3').onclick = HD3_click;
    }
}

function lang_changed() {
    console.log("lang_changed2");
    var selected_lang = document.querySelector('input[name="lang"]:checked').value;
    const rtl_langs = ["fa", "ur", "he", "ar"];
    localStorage.lang = selected_lang;
    // get_course_info(update_course_info);
    if (rtl_langs.includes(selected_lang)) {
        $("html").dir = "rtl";
    }
    else {
        $("html").dir = "ltr";
    }
    console.log("lang_changed");
    display_message();
}



window.onload = function () {
    if (localStorage.getItem('login_status') != 'success') {
        window.location.href = "./login.html";
        return;
    }

    $('Start_learn').addEventListener("click", function () {
        window.location.href = "./user-courses.html";
    });

    lang_changed();
};

