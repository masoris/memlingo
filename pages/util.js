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

var voices = ["male1", "male2", "male3", "female1", "female2", "female3", "ludoviko"];
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
            $("btn_continue").disabled = false;
        });
        audio.play();
        is_playing = true;
        $("btn_continue").disabled = true;
    } catch (e) {
        is_playing = false;
        $("btn_continue").disabled = false;
        console.log('Failed to load audio file.');
    }
    // }
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
                $("btn_continue").disabled = false;
                if (next_url != "") {
                    window.location.href = next_url;
                }
            });
            audio.play();
            is_playing = true;
            $("btn_continue").disabled = true;
        } catch (e) {
            is_playing = false;
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

var lang_str = {
    "ko-kr": {
        "Listen and fill blanks.": "듣고 빈칸을 채우세요.",
        "Match correct pairs.": "짝을 맞추세요.",
        "Choose the level how you feel about this.": "이것이 쉽나요? 어렵나요?",
        "Select what you hear.": "들은 것을 선택하세요.",
        "Select correct one.": "맞는 것을 선택하세요.",
        "You have just learned these words.": "방금 학습하신 목록입니다.",
    }
}

function display_language_str() {
    var lang = localStorage.getItem("lang");
    // 모든 span 요소 가져오기
    var spanElements = document.getElementsByTagName("span");

    // 가져온 span 요소를 반복하여 작업 수행
    for (var i = 0; i < spanElements.length; i++) {
        var span = spanElements[i];
        var txt = span.innerText;
        console.log(txt);
        if (lang in lang_str) {
            if (txt in lang_str[lang]) {
                span.innerText = lang_str[lang][txt];
            }
        }

    }
}

