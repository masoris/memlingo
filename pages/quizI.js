function $(id) {
    return document.getElementById(id);
}

function add_carditem(carditem) {
    carditems = [];
    if (localStorage.getItem("Carditems") != null) {
        carditems = JSON.parse(localStorage.Carditems);
    }
    carditems.push(carditem);
    localStorage.setItem("Carditems", JSON.stringify(carditems));
}



function click_btn_easy_hard(easy_or_hard) {
    email = localStorage.email
    lang = localStorage.lang
    course = localStorage.session_course

    carditem = JSON.parse(localStorage.Carditem)

    console.log("localStorage.quiz_count:" + localStorage.quiz_count);
    quiz_count = parseInt(localStorage.quiz_count) + 1;
    localStorage.setItem("quiz_count", quiz_count.toString());
    console.log("localStorage.quiz_count2:" + localStorage.quiz_count);
    if (localStorage.quiz_count > 10) {
        window.location.href = "session-finish.html";
        return;
    }

    esp_txt = carditem.esp_txt
    if (easy_or_hard == "easy") {
        score = 1
    }
    else {
        score = -1
    }

    // /api/card-next.api
    //         userid, email, cookie:login_status, lang, course
    //         output: 
    //                quiz-card-url, 퀴즈 카드 유형을 랜덤으로 정해서 보내옴
    //                level,esp_txt,kor,eng,group,count,next-review-time, = myprgress.tsv파일의 한 라인임
    //                voice_img,voice_name,esp_txt.mp3 = esp_txt를 음성으로 읽어줄 캐릭터와 음성  
    var jsonStr = JSON.stringify({ email: email, lang: lang, course: course, esp_txt: esp_txt, score: score });
    postAjaxRequest('/api/card-next.api', jsonStr, function (responseJSONStr) {
        responseObj = JSON.parse(responseJSONStr);
        console.log(responseObj);
        // 받아온 output을 이용해서 적절하게 한장의 퀴즈 페이지를 구성한다. 
        if (responseObj['resp'] == "OK") {
            add_carditem(responseObj);

            localStorage.setItem("Carditem", responseJSONStr);
            window.location.href = responseObj.quiz_card_url;
        } else {
            alert('Error' + responseJSONStr);
        }

    }, function (status, responseText) {
        alert(responseText);
        console.error('Error:', status);
        console.error(responseText);
    });
}

function play_sound_url(mp3_url) {
    var audio = new Audio(mp3_url);
    audio.addEventListener('ended', function () {
        audio.pause();
        audio.currentTime = 0;
    });
    audio.play();
}

var j_word = "";
var k_word = "";
function click_option(item) {
    if (item.value == j_word) {
        $('j_word').style.color = 'black';
    } else if (item.value == k_word) {
        $('k_word').style.color = 'black';
    } else {
        item.style.color = 'red';
        setTimeout(function () { item.style.color = 'black' }, 1000);
    }
    if ($('j_word').style.color == 'black') {
        if (k_word != "" && $('k_word').style.color == 'black') {
            $('btn_continue').disabled = false;
        }
    }
}

window.onload = function () {
    if (getCookie('login_status') != 'success') {
        window.location.href = "./login.html";
        return;
    }

    carditem = JSON.parse(localStorage.Carditem)

    $('btn_quit').onclick = function () {
        window.location.href = "./user-courses.html";
    }

    $('speaker').onclick = function () {
        play_sound_url(carditem.mp3_url);
    }

    // play_sound_url(carditem.mp3_url);

    $('btn_listen').onclick = function () {
        play_sound_url(carditem.mp3_url);
        $('eng_txt').innerText = carditem.eng_txt;
        $('kor_txt').innerText = carditem.kor_txt;
    }

    // $('esp_txt').innerText = carditem.esp_txt;
    $('eng_txt').innerText = carditem.eng_txt;
    $('kor_txt').innerText = carditem.kor_txt;

    $('voice_img').src = carditem.voice_img_url;
    esp_txt2 = carditem.esp_txt.replace(",", " ,").replace("?", " ?").replace("!", " !").replace("~", " ~").replace(".", " .");
    esp_txt_words = esp_txt2.trim().split(" ");

    var j = Math.floor(Math.random() * (esp_txt_words.length));
    arr = [",", "?", "!", "~", "."];
    wrd = esp_txt_words[j];
    while (arr.includes(wrd)) {
        j = Math.floor(Math.random() * (esp_txt_words.length));
        wrd = esp_txt_words[j];
    }
    var k = -1;
    if (esp_txt_words.length > 3) {
        k = Math.floor(Math.random() * (esp_txt_words.length));
        wrd = esp_txt_words[k];
        while (arr.includes(wrd) || k == j) {
            k = Math.floor(Math.random() * (esp_txt_words.length));
            wrd = esp_txt_words[k];
        }
    }
    for (i = 0; i < esp_txt_words.length; i++) {
        if (i == j) {
            $('answers').innerHTML = $('answers').innerHTML + "&nbsp;<input id='j_word' style='color:white;' type='button' value='" + esp_txt_words[i] + "'>";
        } else if (i == k) {
            $('answers').innerHTML = $('answers').innerHTML + "&nbsp;<input id='k_word' style='color:white;' type='button' value='" + esp_txt_words[i] + "'>";
        } else {
            $('answers').innerHTML = $('answers').innerHTML + "&nbsp;<input type='button' value='" + esp_txt_words[i] + "'>";
        }
    }

    // j-word와 k-word를 서버에 보내서 그와 유사한 단어를 각각 3개씩 뽑아와서 아래 options항목에 디스플레이한다.
    j_word = esp_txt_words[j];
    k_word = "";
    if (k >= 0) {
        k_word = esp_txt_words[k];
    }
    // rand_words = get_similar_words_jk(j_word, k_word);
    rand_words = ["farti", "fartas", "fartus", "fartis", "farto"];
    for (i = 0; i < rand_words.length; i++) {
        $('options').innerHTML = $('options').innerHTML + "&nbsp;<input onclick='click_option(this)' type='button' value='" + rand_words[i] + "'>";
    }


};


