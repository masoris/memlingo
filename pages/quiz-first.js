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

function click_btn_easy() {
    click_btn_easy_hard("easy")
}

function click_btn_hard() {
    click_btn_easy_hard("hard")
}

function click_btn_easy_hard(easy_or_hard) {
    email = localStorage.email;
    lang = localStorage.lang;
    course = localStorage.session_course;

    // 맞추면 progress bar를 한 칸 진전시킨다.
    if (parseInt(localStorage.quiz_count) < 10) {
        max_cards = 11;
        percent = Math.floor(((parseFloat(localStorage.quiz_count) + 2.0) / max_cards) * 100);
        $('progress').style.width = percent + "%";
    }

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


    // /api/card-submit.api
    //         userid, email, cookie:login_status, lang, course, esp, score
    //         [level,esp,kor,eng,group,count,repeat_date,img_url,voice_name] //다음 항목
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

window.onload = function () {
    if (getCookie('login_status') != 'success') {
        window.location.href = "./login.html";
        return;
    }

    // easy 버튼과 hard 버튼을 listen 버튼을 누르기 전에는 disable 시킨다
    $('btn_hard').disabled = true;
    $('btn_hard').style.color = "#4c5b75";
    $('btn_easy').disabled = true;
    $('btn_easy').style.color = "#4c5b75";


    carditem = JSON.parse(localStorage.Carditem)

    $('btn_quit').onclick = function () {
        window.location.href = "./user-courses.html";
    }

    $('btn_speaker').onclick = function () {
        var audio = new Audio(carditem.mp3_url);
        audio.addEventListener('ended', function () {
            audio.pause();
            audio.currentTime = 0;
        });
        audio.play();

        // easy 버튼과 hard 버튼을 enable시킨다
        $('btn_hard').disabled = false;
        $('btn_hard').style.color = "white";
        $('btn_easy').disabled = false;
        $('btn_easy').style.color = "white";
    }

    $('btn_listen').onclick = function () {
        var audio = new Audio(carditem.mp3_url);
        audio.addEventListener('ended', function () {
            audio.pause();
            audio.currentTime = 0;
        });
        audio.play();

        // easy 버튼과 hard 버튼을 enable시킨다
        $('btn_hard').disabled = false;
        $('btn_hard').style.color = "white";
        $('btn_easy').disabled = false;
        $('btn_easy').style.color = "white";
    }

    $('esp_txt').innerText = carditem.esp_txt;
    $('eng_txt').innerText = carditem.eng_txt;
    $('kor_txt').innerText = carditem.kor_txt;

    $('voice_img').src = carditem.voice_img_url;

    $('btn_hard').onclick = click_btn_hard;
    $('btn_easy').onclick = click_btn_easy;

    // 맞추면 progress bar를 한 칸 진전시킨다.
    if (parseInt(localStorage.quiz_count) < 10) {
        max_cards = 11;
        percent = Math.floor(((parseFloat(localStorage.quiz_count) + 1.0) / max_cards) * 100);
        $('progress').style.width = percent + "%";
    }


};


