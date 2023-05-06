function $(id) {
    return document.getElementById(id);
}



function click_btn_easy() {
    click_btn_easy_hard("easy")
}

function click_btn_hard() {
    click_btn_easy_hard("hard")
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

    esp_txt = carditem.esp_text
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
    //                level,esp_text,kor,eng,group,count,next-review-time, = myprgress.tsv파일의 한 라인임
    //                voice_img,voice_name,esp_text.mp3 = esp_txt를 음성으로 읽어줄 캐릭터와 음성  
    var jsonStr = JSON.stringify({ email: email, lang: lang, course: course, esp_txt: esp_txt, score: score });
    postAjaxRequest('/api/card-next.api', jsonStr, function (responseJSONStr) {
        responseObj = JSON.parse(responseJSONStr);
        console.log(responseObj);
        // 받아온 output을 이용해서 적절하게 한장의 퀴즈 페이지를 구성한다. 
        if (responseObj['resp'] == "OK") {
            if (localStorage.getItem("Carditems") == null) {
                carditems = [];
                carditems.push(responseObj);
                localStorage.setItem("Carditems", JSON.stringify(carditems));
            }
            else {
                carditems = JSON.parse(localStorage.Carditems);
                carditems.push(responseObj);
                localStorage.setItem("Carditems", JSON.stringify(carditems));
            }

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


function get_similar_words(carditem) {

    var email = localStorage.email;
    var lang = localStorage.lang;
    var course = localStorage.session_course;
    var esp_txt = carditem.esp_text;

    var jsonStr = JSON.stringify({ email: email, lang: lang, course: course, esp_txt: esp_txt });
    postAjaxRequest('/api/similar-words.api', jsonStr, function (responseJSONStr) {
        console.log(responseJSONStr)
        responseObj = JSON.parse(responseJSONStr);
        selected_kors = [];
        selected_esps = [];
        for (i = 0; i<4; i++){
            selected_item = responseObj.selected[i];
            selected_kors[i] = selected_item[0];
            selected_esps[i] = selected_item[1];
        }
        selected_kors.sort(() => Math.random() - 0.5);
        selected_esps.sort(() => Math.random() - 0.5);
        $('right_1_txt').innerText = selected_kors[0];
        $('right_2_txt').innerText = selected_kors[1];
        $('right_3_txt').innerText = selected_kors[2];
        $('right_4_txt').innerText = selected_kors[3];
        $('left_1_txt').innerText = selected_esps[0];
        $('left_2_txt').innerText = selected_esps[1];
        $('left_3_txt').innerText = selected_esps[2];
        $('left_4_txt').innerText = selected_esps[3];

        // 받아온 output을 이용해서 적절하게 한장의 퀴즈 페이지를 구성한다. 
        // if (responseObj['resp'] == "OK") {
        //     if (localStorage.getItem("Carditems") == null){
        //         carditems = [];
        //         carditems.push(responseObj);
        //         localStorage.setItem("Carditems",JSON.stringify(carditems));
        //     }
        //     else{
        //         carditems = JSON.parse(localStorage.Carditems);
        //         carditems.push(responseObj);
        //         localStorage.setItem("Carditems",JSON.stringify(carditems));
        //     }

        //     localStorage.setItem("Carditem", responseJSONStr);
        //     window.location.href = responseObj.quiz_card_url;
        // } else {
        //     alert('Error' + responseJSONStr);
        // }

    }, function (status, responseText) {
        alert(responseText);
        console.error('Error:', status);
        console.error(responseText);
    });

}

function word_click(item){
    alert(item);
}

window.onload = function () {
    if (getCookie('login_status') != 'success') {
        window.location.href = "./login.html";
        return;
    }

    carditem = JSON.parse(localStorage.Carditem);
    words = get_similar_words(carditem);
    $('btn_continue').disabled = true;
    $('right_1').onclick = function(){ word_click('right_1');};
    $('right_2').onclick = function(){ word_click('right_2');};
    $('right_3').onclick = function(){ word_click('right_3');};
    $('right_4').onclick = function(){ word_click('right_4');};
    $('left_1').onclick = function(){ word_click('left_1');};
    $('left_2').onclick = function(){ word_click('left_2');};
    $('left_3').onclick = function(){ word_click('left_3');};
    $('left_4').onclick = function(){ word_click('left_4');};

    // $('btn_quit').onclick = function () {
    //     window.location.href = "./user-courses.html";
    // }

    // $('btn_speaker').onclick = function () {
    //     var audio = new Audio(carditem.mp3_url);
    //     audio.addEventListener('ended', function () {
    //         audio.pause();
    //         audio.currentTime = 0;
    //     });
    //     audio.play();
    // }

    // $('btn_listen').onclick = function () {
    //     var audio = new Audio(carditem.mp3_url);
    //     audio.addEventListener('ended', function () {
    //         audio.pause();
    //         audio.currentTime = 0;
    //     });
    //     audio.play();
    // }

    // $('esp_txt').innerText = carditem.esp_text;
    // $('eng_txt').innerText = carditem.eng_text;
    // $('kor_txt').innerText = carditem.kor_text;

    // $('voice_img').src = carditem.voice_img_url;

    // $('btn_hard').onclick = click_btn_hard;
    // $('btn_easy').onclick = click_btn_easy;





};


