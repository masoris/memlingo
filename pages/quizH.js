function get_similar_words(carditem) {

    var email = localStorage.email;
    var lang = localStorage.lang;
    var course = localStorage.session_course;
    var esp_txt = carditem.esp_txt;

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
        selected_esps.sort(() => Math.random() - 0.5);
        $('block_1_txt').innerText = selected_esps[0];
        $('block_2_txt').innerText = selected_esps[1];
        $('block_3_txt').innerText = selected_esps[2];
        $('block_4_txt').innerText = selected_esps[3];

    }, function (status, responseText) {
        alert(responseText);
        console.error('Error:', status);
        console.error(responseText);
    });

}


function click_continue() {
    email = localStorage.email
    lang = localStorage.lang
    course = localStorage.session_course

    carditem = JSON.parse(localStorage.Carditem)
    esp_txt = carditem.esp_txt;

    console.log("localStorage.quiz_count:" + localStorage.quiz_count);
    quiz_count = parseInt(localStorage.quiz_count) + 1;
    localStorage.setItem("quiz_count", quiz_count.toString());
    console.log("localStorage.quiz_count2:" + localStorage.quiz_count);
    if (quiz_count >= 10) { //TODO 임시로 10을 2로 바꿨음.
        play_sound_esp_next_url(esp_txt, "session-finish.html");
        return;
    }


    // /api/card-next.api
    //         userid, email, cookie:login_status, lang, course
    //         output: 
    //                quiz-card-url, 퀴즈 카드 유형을 랜덤으로 정해서 보내옴
    //                level,esp_txt,kor,eng,group,count,next-review-time, = myprgress.tsv파일의 한 라인임
    //                voice_img,voice_name,esp_txt.mp3 = esp_txt를 음성으로 읽어줄 캐릭터와 음성  
    var jsonStr = JSON.stringify({ email: email, lang: lang, course: course, esp_txt: esp_txt, score: "0" });
    postAjaxRequest('/api/card-next.api', jsonStr, function (responseJSONStr) {
        responseObj = JSON.parse(responseJSONStr);
        console.log(responseObj);
        // 받아온 output을 이용해서 적절하게 한장의 퀴즈 페이지를 구성한다. 
        if (responseObj['resp'] == "OK") {

            add_carditem(responseObj);

            localStorage.setItem("Carditem", responseJSONStr);
            play_sound_esp_next_url(esp_txt, responseObj.quiz_card_url);

        } else {
            alert('Error' + responseJSONStr);
        }

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
    esp_txt_card = JSON.parse(localStorage.Carditem).esp_txt;
    kor_txt_card = JSON.parse(localStorage.Carditem).kor_txt;

    //현재 클릭된 esp_txt를 받아낸다.
    var esp_txt = $(item + '_txt').innerText
    play_sound_esp(esp_txt);

    //만약에 match되면 현재 아이템을 색깔을 selected로 바꾼다.
    if (esp_txt_card.trim() == esp_txt.trim()) {
        $("kor_txt").innerText = JSON.parse(localStorage.Carditem).kor_txt;
        $(item + '_border').style.borderColor = selected_color;
        $(item).style.backgroundColor = selected_color;

        // 맞추면 continue 버튼을 켠다.
        $('btn_listen_continue').disabled = false;
        $('btn_listen_continue').style.color = "white";
        $('rectangle_continue').style.display = "block";
        $('rectangle_listen').style.width = "96%";
        $('rectangle_listen').style.display = "none";
        // 맞추면 progress bar를 한 칸 진전시킨다.
        max_cards = 11;
        percent = Math.floor(((parseFloat(localStorage.quiz_count) + 2.0) / max_cards) * 100);
        $('progress').style.width = percent + "%";

        //해당 esp_txt 항목에 대해서 플러스 점수를 준다. 
        put_score(esp_txt, 1);

        for (i = 0; i < 4; i++) {
            block_i = 'block_' + (i + 1);
            if (item == block_i) {
                continue;
            }
            $(block_i + '_border').style.borderColor = disabled_color;
            $(block_i).style.backgroundColor = disabled_color;
            $(block_i).style.pointerEvents = "none"; //해당 div 사각형이 눌러지지 않게 한다.
        }
        esp_txt = JSON.parse(localStorage.Carditem).esp_txt;

        return;
    }

    //매칭이 안되면 현재 아이템 색깔을 wrong색깔로 바꾼다.
    $(item + '_border').style.borderColor = wrong_color;
    $(item).style.backgroundColor = wrong_color;

    //만약에 이전에 틀린 항목이 있으면 그것도 꺼버린다.
    wrong_prev_item = localStorage.getItem("wrong_prev_item");
    if (wrong_prev_item != "") {
        $(wrong_prev_item + '_border').style.borderColor = default_color;
        $(wrong_prev_item).style.backgroundColor = default_color;
        localStorage.wrong_prev_item = "";
    }

    // 해당 esp_txt 항목에 대해서 마이너스 점수를 준다.
    put_score(esp_txt, -1);
    localStorage.setItem("wrong_prev_item", item);
}

window.onload = function () {
    if (localStorage.getItem('login_status') != 'success') {
        window.location.href = "./login.html";
        return;
    }

    // display_language_str();
    display_message();

    $('btn_quit').onclick = function () {
        window.location.href = "./user-courses.html";
    }

    $('btn_listen_continue').onclick = click_continue;
    $('rectangle_continue').style.display = "none";
    $('rectangle_listen').style.width = "96%";

    // 맞추면 progress bar를 한 칸 진전시킨다.
    max_cards = 11;
    percent = Math.floor(((parseFloat(localStorage.quiz_count) + 1.0) / max_cards) * 100);
    $('progress').style.width = percent + "%";


    carditem = JSON.parse(localStorage.Carditem);
    get_similar_words(carditem);
    localStorage.setItem('wrong_prev_item', '');

    // $('kor_txt').innerText = carditem.kor_txt;
    $('eng_txt').innerText = carditem.eng_txt;

    $('speaker').onclick = function () {
        play_sound_esp(carditem.esp_txt);
    }

    $('btn_listen').onclick = function () {
        play_sound_esp(carditem.esp_txt);
    }

    //처음에는 continue버튼이 눌러지지 않게 시작한다.
    $('btn_listen_continue').disabled = true;
    $('btn_listen_continue').style.color = "#4c5b75";

    $('block_1').onclick = function () { word_click('block_1'); };
    $('block_2').onclick = function () { word_click('block_2'); };
    $('block_3').onclick = function () { word_click('block_3'); };
    $('block_4').onclick = function () { word_click('block_4'); };

    $('block_1_border').style.borderColor = default_color;
    $('block_1').style.backgroundColor = default_color;
    $('block_2_border').style.borderColor = default_color;
    $('block_2').style.backgroundColor = default_color;
    $('block_3_border').style.borderColor = default_color;
    $('block_3').style.backgroundColor = default_color;
    $('block_4_border').style.borderColor = default_color;
    $('block_4').style.backgroundColor = default_color;
};


