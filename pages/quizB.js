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
        localStorage.setItem('similar_words', JSON.stringify(responseObj.selected));
        for (i = 0; i < 4; i++) {
            selected_item = responseObj.selected[i];
            selected_esps[i] = selected_item[0];
            selected_kors[i] = selected_item[1];
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
const selected_color = '#03bf6b';
const default_color = '#49c0f8';
const wrong_color = '#ff5c58';
const disabled_color = '#dddddd';

function word_click(item) {
    // 지금 선택한 것이 처음이면 prev_item에 기억시키고 selected색깔로 바꾼다.
    if (localStorage.getItem("prev_item") == '') {
        localStorage.setItem("prev_item", item);
        $(item + '_border').style.borderColor = selected_color;
        $(item).style.backgroundColor = selected_color;
        $(item).style.opacity = 0.1;
        return;
    }

    //만약에 새로 선택한 item이 prev_item(이전 아이템)과 같으면 무시
    prev_item = localStorage.prev_item;
    if (prev_item == item) {
        return;
    }

    //만약에 현재 아이템과 이전 아이템이 같은 쪽이면 이전 아이템을 끄고, 새로운 아이템만 선택하도록 한다.
    if (item.substring(0, 5) == prev_item.substring(0, 5)) {
        $(prev_item + '_border').style.borderColor = default_color;
        $(prev_item).style.backgroundColor = default_color;
        $(prev_item).style.opacity = 0.1;

        $(item + '_border').style.borderColor = selected_color;
        $(item).style.backgroundColor = selected_color;
        $(item).style.opacity = 0.1;
        localStorage.prev_item = item;

        //만약에 이전에 틀린 항목이 있으면 그것도 꺼버린다.
        wrong_prev_item = localStorage.getItem("wrong_prev_item");
        if(wrong_prev_item != ""){
            $(wrong_prev_item + '_border').style.borderColor = default_color;
            $(wrong_prev_item).style.backgroundColor = default_color;
            $(wrong_prev_item).style.opacity = 0.1;
            localStorage.wrong_prev_item = "";
        }
        return;
    }

    //이전 아이템과 현재 아이템으로 부터 esp_txt와 kor_txt를 받아낸다.
    var esp_txt = "";
    var kor_txt = "";
    if (item.indexOf("left") >= 0) {
        esp_txt = $(item + '_txt').innerText
    } else {
        kor_txt = $(item + '_txt').innerText
    }
    if (prev_item.indexOf("left") >= 0) {
        esp_txt = $(prev_item + '_txt').innerText
    } else {
        kor_txt = $(prev_item + '_txt').innerText
    }

    //현재 선택한 esp_txt와 kor_txt 쌍이 서버에서 가져온 유사단어 쌍과 매치 되는지 확인
    similar_words = JSON.parse(localStorage.similar_words);
    console.log(esp_txt + kor_txt);
    console.log(localStorage.similar_words);
    matched = false;
    for (i = 0; i < 4; i++) {
        console.log(similar_words[i][0]);
        console.log(similar_words[i][1]);
        if (esp_txt == similar_words[i][0] && kor_txt == similar_words[i][1]) {
            matched = true;
        }
    }
    console.log(matched);
    //만약에 match되면 현재 아이템을 색깔을 selected로 바꾼다.
    if (matched) {
        $(item + '_border').style.borderColor = selected_color;
        $(item).style.backgroundColor = selected_color;
        $(item).style.opacity = 0.1;

        // 1초 후에 item과 prev_item을 disable 시킨다.
        function disable_matched_items() {
            $(item + '_border').style.borderColor = disabled_color;
            $(item).style.backgroundColor = disabled_color;
            $(item).style.opacity = 0.1;
            $(item).style.pointerEvents = "none";
            $(prev_item + '_border').style.borderColor = disabled_color;
            $(prev_item).style.backgroundColor = disabled_color;
            $(prev_item).style.opacity = 0.1;
            $(prev_item).style.pointerEvents = "none";
        }
        setTimeout(disable_matched_items, 1000); 

        //prev_item을 초기화 한다.
        localStorage.prev_item = "";
        
        //만약에 이전에 틀린 항목이 있으면 그것도 꺼버린다.
        wrong_prev_item = localStorage.getItem("wrong_prev_item");
        if(wrong_prev_item != ""){
            $(wrong_prev_item + '_border').style.borderColor = default_color;
            $(wrong_prev_item).style.backgroundColor = default_color;
            $(wrong_prev_item).style.opacity = 0.1;
            localStorage.wrong_prev_item = "";
        }
        return;
    }

    //매칭이 안되면 현재 아이템 색깔을 wrong색깔로 바꾼다.
    $(item + '_border').style.borderColor = wrong_color;
    $(item).style.backgroundColor = wrong_color;
    $(item).style.opacity = 0.1;

    localStorage.setItem("wrong_prev_item",item);


}

window.onload = function () {
    if (getCookie('login_status') != 'success') {
        window.location.href = "./login.html";
        return;
    }

    carditem = JSON.parse(localStorage.Carditem);
    get_similar_words(carditem);
    localStorage.setItem('prev_item', '');
    localStorage.setItem('wrong_prev_item', '');
    $('btn_continue').disabled = true;
    $('right_1').onclick = function () { word_click('right_1'); };
    $('right_2').onclick = function () { word_click('right_2'); };
    $('right_3').onclick = function () { word_click('right_3'); };
    $('right_4').onclick = function () { word_click('right_4'); };
    $('left_1').onclick = function () { word_click('left_1'); };
    $('left_2').onclick = function () { word_click('left_2'); };
    $('left_3').onclick = function () { word_click('left_3'); };
    $('left_4').onclick = function () { word_click('left_4'); };

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


