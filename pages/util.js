function $(id) {
    return document.getElementById(id);
}

var is_playing = false;
function play_sound_url(url) {
    try {
        var audio = new Audio("/api/playsound.api?voice_esp_txt_mp3=" + url);
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

    for (i = 0; i < voices.length; i++) {
        url = "/api/playsound.api?voice_esp_txt_mp3=" + voices[i] + "/" + esp_txt + ".mp3";
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

function play_sound_esp_next_url(esp_txt, next_url) {
    // Fisher-Yates Shuffle 알고리즘
    for (let i = voices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [voices[i], voices[j]] = [voices[j], voices[i]];
    }

    for (i = 0; i < voices.length; i++) {
        url = "/api/playsound.api?voice_esp_txt_mp3=" + voices[i] + "/" + esp_txt + ".mp3";
        try {
            if (is_playing == true) {
                break;
            }
            let audio = new Audio(url);
            audio.addEventListener('ended', function () {
                audio.currentTime = 0;
                is_playing = false;
                if (next_url != null && next_url != "") {
                    window.location.href = next_url;
                }
            });
            audio.play();
            is_playing = true;
        } catch (e) {
            is_playing = false;
            if (next_url != null && next_url != "") {
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

