function click_continue() {
    window.location.href = "session-start.html?time=" + new Date().getTime();
}

function click_speaker(esp_txt_span) {
    play_sound_esp($(esp_txt_span).innerText);
}

function call_session_finish_api() {
    email = localStorage.email
    lang = localStorage.lang
    course = localStorage.session_course

    var jsonStr = JSON.stringify({ email: email, lang: lang, course: course });
    postAjaxRequest('/api/session-finish.api', jsonStr, function (responseJSONStr) {
        responseObj = JSON.parse(responseJSONStr);
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
    call_session_finish_api();

    // display_language_str();
    display_message();

    $('btn_continue').onclick = click_continue;

    carditems = JSON.parse(localStorage.Carditems);

    user_courses = JSON.parse(localStorage.user_courses);
    course_name = user_courses[localStorage.session_course].name;
    $("course_name").innerText = course_name;

    for (i = 0; i < carditems.length && i < 10; i++) {
        carditem = carditems[i];
        $('esp_txt_' + (i + 1)).innerText = carditem.esp_txt;
        $('kor_txt_' + (i + 1)).innerText = carditem.kor_txt;
        $('eng_txt_' + (i + 1)).innerText = carditem.eng_txt;
        // esp_txt = carditem.esp_txt;
        // $('speaker_' + (i + 1)) = function (esp_txt) {

    };
    $('speaker_1').onclick = function () { click_speaker('esp_txt_1'); };
    $('speaker_2').onclick = function () { click_speaker('esp_txt_2'); };
    $('speaker_3').onclick = function () { click_speaker('esp_txt_3'); };
    $('speaker_4').onclick = function () { click_speaker('esp_txt_4'); };
    $('speaker_5').onclick = function () { click_speaker('esp_txt_5'); };
    $('speaker_6').onclick = function () { click_speaker('esp_txt_6'); };
    $('speaker_7').onclick = function () { click_speaker('esp_txt_7'); };
    $('speaker_8').onclick = function () { click_speaker('esp_txt_8'); };
    $('speaker_9').onclick = function () { click_speaker('esp_txt_9'); };
    $('speaker_10').onclick = function () { click_speaker('esp_txt_10'); };
};


