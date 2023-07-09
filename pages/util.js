function $(id) {
    return document.getElementById(id);
}



var is_playing = false;
function play_sound_url(url) {
    try {
        var email = localStorage.getItem("email");
        var audio = new Audio("/api/playsound.api?email=" + email + "&voice_esp_txt_mp3=" + url + "&t=" + new Date().getTime());
        audio.addEventListener('ended', function () {
            audio.pause();
            audio.currentTime = 0;
            is_playing = false;
        });
        if (!is_playing) {
            audio.play();
            is_playing = true;
        }
    }
    catch (e) {
        is_playing = false;
        console.log('Failed to load audio file.');
    }
}

var voices = ["male1", "male2", "female1", "female2", "ludoviko"];
function play_sound_esp(esp_txt) {
    // Fisher-Yates Shuffle 알고리즘
    for (let i = voices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [voices[i], voices[j]] = [voices[j], voices[i]];
    }

    // for (i = 0; i < voices.length; i++) {
    var email = localStorage.getItem("email");
    url = "/api/playsound.api?email=" + email + "&voice_esp_txt_mp3=" + voices[0] + "/" + esp_txt + ".mp3" + "&t=" + new Date().getTime();
    try {
        // if (is_playing == true) {
        // break;
        // }
        let audio = new Audio(url);
        audio.addEventListener('ended', function () {
            audio.currentTime = 0;
            is_playing = false;
            if ($("btn_listen_continue") != null) $("btn_listen_continue").disabled = false;
            if ($("btn_continue") != null) $("btn_continue").disabled = false;
        });
        audio.play();
        is_playing = true;
        if ($("btn_listen_continue") != null) $("btn_listen_continue").disabled = true;
        if ($("btn_continue") != null) $("btn_continue").disabled = true;
    } catch (e) {
        is_playing = false;
        if ($("btn_listen_continue") != null) $("btn_listen_continue").disabled = false;
        if ($("btn_continue") != null) $("btn_continue").disabled = false;
        console.log('Failed to load audio file.');
    }
    // }
}


function play_sound_esp_voice(esp_txt, voice) {
    var email = "hiongun@gmail.com";
    var url = "/api/playsound.api?email=" + email + "&voice_esp_txt_mp3=" + voice + "/" + esp_txt + ".mp3" + "&t=" + new Date().getTime();
    try {
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

function play_sound_esp_next_url(esp_txt, next_url) {
    // Fisher-Yates Shuffle 알고리즘
    for (let i = voices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [voices[i], voices[j]] = [voices[j], voices[i]];
    }
    is_playing = false;
    for (i = 0; i < voices.length; i++) {
        var email = localStorage.getItem("email");
        var mp3_url = "/api/playsound.api?email=" + email + "&voice_esp_txt_mp3=" + voices[i] + "/" + esp_txt + ".mp3" + "&t=" + new Date().getTime();
        try {
            if (is_playing == true) {
                break;
            }
            let audio = new Audio(mp3_url);
            audio.addEventListener('ended', function () {
                audio.currentTime = 0;
                is_playing = false;
                if ($("btn_continue") != null) {
                    $("btn_continue").disabled = false;
                }
                if (next_url != "") {
                    window.location.href = next_url;
                }
            });
            audio.play();
            is_playing = true;
            if ($("btn_continue") != null) {
                $("btn_continue").disabled = true;
            }
        } catch (e) {
            is_playing = false;
            if ($("btn_continue") != null)
                $("btn_continue").disabled = false;
            if (next_url != "") {
                window.location.href = next_url;
            }
            console.log('Failed to load audio file.');
        }
    }
}

function put_score(esp_txt, score) {

    var email = localStorage.email;
    var lang = localStorage.lang;
    var course = localStorage.session_course;

    var jsonStr = JSON.stringify({ email: email, lang: lang, course: course, esp_txt: esp_txt, score: score });
    postAjaxRequest('/api/put-score.api', jsonStr, function (responseJSONStr) {
        console.log(responseJSONStr)
        responseObj = JSON.parse(responseJSONStr);

    }, function (status, responseText) {
        alert(responseText);
        console.error('Error:', status);
        console.error(responseText);
    });
}

function put_score_kor(kor_txt, score) {

    var email = localStorage.email;
    var lang = localStorage.lang;
    var course = localStorage.session_course;

    var jsonStr = JSON.stringify({ email: email, lang: lang, course: course, kor_txt: kor_txt, score: score });
    postAjaxRequest('/api/put-score-kor.api', jsonStr, function (responseJSONStr) {
        console.log(responseJSONStr)
        responseObj = JSON.parse(responseJSONStr);

    }, function (status, responseText) {
        alert(responseText);
        console.error('Error:', status);
        console.error(responseText);
    });
}

function add_carditem(carditem) {
    carditems = [];
    if (localStorage.getItem("Carditems") != null) {
        carditems = JSON.parse(localStorage.Carditems);
    }
    carditems.push(carditem);
    localStorage.setItem("Carditems", JSON.stringify(carditems));
}


function get_course_info(update_course_info) {
    const email = localStorage.getItem("email");
    const lang = localStorage.getItem("lang");

    var jsonStr = JSON.stringify({ email: email, lang: lang });
    postAjaxRequest('/api/get_course_info.api', jsonStr, function (responseJSONStr) {
        responseObj = JSON.parse(responseJSONStr);

        if (responseObj['resp'] == "OK") {
            localStorage.setItem('user_courses', JSON.stringify(responseObj['user_courses']));
            update_course_info();
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

// var lang_str = {
//     "ko-kr": {
//         "Listen and fill blanks.": "듣고 빈칸을 채우세요.",
//         "Match correct pairs.": "짝을 맞추세요.",
//         "Choose the level how you feel about this.": "이것이 쉽나요? 어렵나요?",
//         "Select what you hear.": "들은 것을 선택하세요.",
//         "Select correct one.": "맞는 것을 선택하세요.",
//         "You have just learned these words.": "방금 학습하신 목록입니다.",
//     }
// }

// function display_language_str() {
//     var lang = localStorage.getItem("lang");
//     // 모든 span 요소 가져오기
//     var spanElements = document.getElementsByTagName("span");

//     // 가져온 span 요소를 반복하여 작업 수행
//     for (var i = 0; i < spanElements.length; i++) {
//         var span = spanElements[i];
//         var txt = span.innerText;
//         console.log(txt);
//         if (lang in lang_str) {
//             if (txt in lang_str[lang]) {
//                 span.innerText = lang_str[lang][txt];
//             }
//         }

//     }
// }


var lang_msgs = {
    "ko-kr": {
        "type_e-mail": "이메일 주소를 입력해 주세요.",
        "type_e-mail_again": "이메일 주소를 한 번 더 입력해 주세요.",
        "type_e-mail_twice": "이메일을 두 번 입력해주세요.",
        "listen_and_fill": "듣고 빈칸을 채우세요.",
        "match_correct": "짝을 맞추세요.",
        "choose_the_level": "이것이 쉽나요? 어렵나요?",
        "select_what_you_hear": "들어보고 선택하세요.",
        "select_correct_one": "맞는 것을 선택하세요.",
        "learned_these_words": "방금 학습하신 목록입니다.",
        "span_learn_by_examples": "예제를 통한 에스페란토 학습",
        "Btn_Start_learning": "학습 시작하기",
        "btn_continue": "다음",
        "btn_listen_continue": "듣고 다음으로",
        "btn_listen": "들어보기",
        "btn_hard": "어려워요",
        "btn_easy": "쉬워요",
        "btn_login": "로그인",
        "Btn_StartA": "학습시작",
        "Btn_StartB": "학습시작",
        "Btn_StartC": "학습시작",
        "Btn_logout": "로그아웃",
    },
    "en-us": {
        "type_e-mail": "Type in your e-mail adress.",
        "type_e-mail_again": "Type in your e-mail adress again.",
        "type_e-mail_twice": "Enter your e-mail twice.",
        "listen_and_fill": "Listen and fill blanks.",
        "match_correct": "Match correct pairs.",
        "choose_the_level": "Choose the level how you feel about this.",
        "select_what_you_hear": "Select what you hear.",
        "select_correct_one": "Select correct one.",
        "learned_these_words": "You have just learned these words.",
        "span_learn_by_examples": "Learn Esperanto by Examples",
        "Btn_Start_learning": "Start Learning",
        "btn_continue": "Continue",
        "btn_listen_continue": "Listen and Continue",
        "btn_listen": "Listen",
        "btn_hard": "Hard for me",
        "btn_easy": "Easy to me",
        "btn_login": "Login",
        "Btn_StartA": "Start Learning",
        "Btn_StartB": "Start Learning",
        "Btn_StartC": "Start Learning",
        "Btn_logout": "Logout",
    }
};



function display_msg(item, field, msg_id) {
    var lang = localStorage.lang;
    if ($(item) != null) {
        var msg = "";
        if (lang in lang_msgs) {
            if (msg_id in lang_msgs[lang]) {
                msg = lang_msgs[lang][msg_id];
            }
            else {
                msg = lang_msgs["en-us"][msg_id];
            }
        }
        else {
            msg = lang_msgs["en-us"][msg_id];
        }

        if (field == "placeholder") $(item).placeholder = msg;
        if (field == "innerText") $(item).innerText = msg;
        if (field == "value") $(item).value = msg;
    }
}

function display_message() {
    // var lang = localStorage.lang;
    // alert("display_msg" + lang);
    display_msg("email1", "placeholder", "type_e-mail");
    display_msg("email2", "placeholder", "type_e-mail_again");
    display_msg("span_message_email_twice", "innerText", "type_e-mail_twice");
    display_msg("span_learn_by_examples", "innerText", "span_learn_by_examples");
    display_msg("Btn_Start_learning", "value", "Btn_Start_learning");
    display_msg("btn_continue", "value", "btn_continue");
    display_msg("match_correct", "innerText", "match_correct");
    display_msg("select_what_you_hear", "innerText", "select_what_you_hear");
    display_msg("btn_listen_continue", "value", "btn_listen_continue");
    display_msg("btn_listen", "value", "btn_listen");
    display_msg("select_what_you_hear", "innerText", "select_what_you_hear");
    display_msg("select_correct_one", "innerText", "select_correct_one");
    display_msg("choose_the_level", "innerText", "choose_the_level");
    display_msg("btn_hard", "value", "btn_hard");
    display_msg("btn_easy", "value", "btn_easy");
    display_msg("listen_and_fill", "innerText", "listen_and_fill");
    display_msg("learned_these_words", "innerText", "learned_these_words");
    display_msg("btn_login", "value", "btn_login");
    display_msg("Btn_StartA", "value", "Btn_StartA");
    display_msg("Btn_StartB", "value", "Btn_StartB");
    display_msg("Btn_StartC", "value", "Btn_StartC");
    display_msg("Btn_logout", "value", "Btn_logout");

    // if ($('lang').value == 'ko-kr') {
    //     $('email1').placeholder = "이메일 주소를 입력해 주세요.";
    //     $('email2').placeholder = "이메일 주소를 한 번 더 입력해 주세요.";
    //     $('span_message_email_twice').innerText = "이메일을 두 번 입력해주세요.";
    // }
    // else {
    //     $('email1').placeholder = "Type in your e-mail adress.";
    //     $('email2').placeholder = "Type in your e-mail adress again.";
    //     $('span_message_email_twice').innerText = "Enter your e-mail twice.";
    // }
}