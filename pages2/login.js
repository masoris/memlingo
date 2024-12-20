function isValidEmail(email) {
    if (email.length > 50) {
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function onlogin_click() {
    const email1 = $('email1').value;
    const email2 = $('email2').value;
    if (document.querySelector('input[name="lang"]:checked') == null) {
        alert("Please choose your language\n\nBonvole elektu vian lingvon");
        return;
    }
    const lang = localStorage.lang;
    if (!isValidEmail(email1)) {
        alert("Invalid Email format\n\nMalvalida retpoŝt-adreso");
        return;
    }
    if (email1 != email2) {
        alert("Email1 is not same with Email2\n\nRetadreso1 malsamas al retadreso2");
        return;
    }

    // background-color: #4c5b75;

    var jsonStr = JSON.stringify({ email1: email1, email2: email2, lang: lang });
    postAjaxRequest('/api2/login.api', jsonStr, function (responseJSONStr) {
        responseObj = JSON.parse(responseJSONStr);

        if (responseObj['resp'] == "OK") {
            //'resp': 'OK', 'user': email1[:email1.find('@')], 'email': email1, "lang": lang
            localStorage.setItem('user', responseObj['user']);
            localStorage.setItem('email', responseObj['email']);
            localStorage.setItem('lang', responseObj['lang']);
            localStorage.setItem('login_status', 'success');
            // localStorage.setItem('user_courses', JSON.stringify(responseObj['user_courses']));
            // alert(getCookie('login_status'));
            window.location.href = "./home.html";
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

function enable_disable_login_button() { //항상 로그인 버튼을 보여준다.
    $('btn_login').disabled = false;
    $('btn_login').style.backgroundColor = "#57CC02";
    $('btn_login').style.color = "white";
    $('btn_login').style.boxShadow = "2px 0 8px 0 rgba(0, 0, 0, 0.2)";

    // if ($('email1').value == $('email2').value && isValidEmail($('email1').value)) {
    // } else {
    //     $('btn_login').disabled = true;
    //     $('btn_login').style.backgroundColor = "white";
    //     $('btn_login').style.color = "white";
    //     $('btn_login').style.boxShadow = "2px 0 8px 0 rgba(0, 0, 0, 0.2)";
    // }
};

function lang_changed() {
    if (document.querySelector('input[name="lang"]:checked') == null) {
        return;
    }
    var selected_lang = document.querySelector('input[name="lang"]:checked').value;
    const rtl_langs = ["fa", "ur", "he", "ar"];
    localStorage.lang = selected_lang;
    if (rtl_langs.includes(selected_lang)) {
        $("html").dir = "rtl";
    }
    else {
        $("html").dir = "ltr";
    }
    display_message();

}



window.onload = function () {
    // enterFullscreen();
    //최초에 login버튼을 누르지 못하는 상태로 초기화 한다.
    // $('btn_login').disabled = true;
    // $('btn_login').style.backgroundColor = "white";
    // $('btn_login').style.color = "white";
    // $('btn_login').style.boxShadow = "2px 0 8px 0 rgba(0, 0, 0, 0.2)";
    enable_disable_login_button()


    $('btn_login').onclick = onlogin_click;
    $('email2').onchange = function (event) {
        enable_disable_login_button();
    };
    $('email2').oninput = function (event) {
        enable_disable_login_button();
    };
    $('email2').onkeydown = function (event) {
        enable_disable_login_button();
        if (event.key === "Enter") {
            onlogin_click();
            // alert($('email2').value);
        }
    };
    $('email2').onkeyup = function (event) {
        enable_disable_login_button();
    };
    $('email1').onchange = function (event) {
        enable_disable_login_button();
    };
    $('email1').oninput = function (event) {
        enable_disable_login_button();
    };
    $('email1').onkeydown = function (event) {
        enable_disable_login_button();
        if (event.key === "Enter") {
            onlogin_click();
            // alert($('email2').value);
        }
    };
    $('email1').onkeyup = function (event) {
        enable_disable_login_button();
    };


    if (localStorage.getItem('email') != null) {
        $('email1').value = localStorage.getItem('email');
        $('email2').value = localStorage.getItem('email');
        enable_disable_login_button();
    }

    // 모든 라디오 버튼을 선택
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radioButton => {
        $(radioButton.id).onclick = lang_changed;
    });


    // $("radio-ko-kr").onclick = lang_changed;
    // $("radio-en-us").onclick = lang_changed;
    // $("radio-ja-jp").onclick = lang_changed;
    // $("radio-zh-cn").onclick = lang_changed;
    // $("radio-zh-tw").onclick = lang_changed;
    // $("radio-vi-vn").onclick = lang_changed;
    // $("radio-mn").onclick = lang_changed;
    // $("radio-th").onclick = lang_changed;
    // $("radio-ms").onclick = lang_changed;
    // $("radio-id").onclick = lang_changed;
    // $("radio-hi").onclick = lang_changed;
    // $("radio-fa").onclick = lang_changed;
    // $("radio-ne").onclick = lang_changed;
    // $("radio-ur").onclick = lang_changed;
    // $("radio-tr").onclick = lang_changed;
    // $("radio-he").onclick = lang_changed;
    // $("radio-ar").onclick = lang_changed;
    // $("radio-fr").onclick = lang_changed;

    if (localStorage.getItem('lang') != null) {
        var lang = localStorage.getItem('lang');
        $("radio-" + lang).checked = true;
    }
    // } else {
    //     $("radio-ko-kr").checked = true;
    // }

    lang_changed();
    // display_message();
    localStorage.setItem('login_status', 'logout');

    //parentBgColor("#03bf6b");
};
