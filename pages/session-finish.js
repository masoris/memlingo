function $(id) {
    return document.getElementById(id);
}

var voices = ["male1", "male2", "male3", "female1", "female2", "female3", "ludoviko"];
var is_playing = false;

function play_sound(esp_txt) {
    // Fisher-Yates Shuffle 알고리즘
    for (let i = voices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [voices[i], voices[j]] = [voices[j], voices[i]];
    }

    for (i = 0; i < voices.length; i++) {
        url = "../sounds/" + voices[i] + "/" + esp_txt + ".mp3";
        try {
            if (is_playing == true) {
                break;
            }
            let audio = new Audio(url);
            audio.addEventListener('ended', function () {
                audio.currentTime = 0;
                is_playing = false;
            });
            audio.play();
            is_playing = true;
        } catch (e) {
            is_playing = false;
            console.log('Failed to load audio file.');
        }
    }
}

function click_continue() {
    window.location.href = "session-start.html"
}

function click_speaker(esp_txt_span) {
    play_sound($(esp_txt_span).innerText);
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

    $('btn_continue').onclick = click_continue;

    carditems = JSON.parse(localStorage.Carditems);

    for (i = 0; i < carditems.length; i++) {
        carditem = carditems[i];
        $('esp_txt_' + (i + 1)).innerText = carditem.esp_txt;
        $('kor_txt_' + (i + 1)).innerText = carditem.kor_txt;
        $('eng_txt_' + (i + 1)).innerText = carditem.eng_txt;
        // esp_txt = carditem.esp_txt;
        // $('speaker_' + (i + 1)) = function (esp_txt) {
        //     play_sound(esp_txt);
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


