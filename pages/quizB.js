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
            selected_esps[i] = selected_item[0].trim();
            selected_kors[i] = selected_item[1].trim();
        }
        selected_kors.sort(() => Math.random() - 0.5);
        selected_esps.sort(() => Math.random() - 0.5);
        $('right_1_txt').innerText = selected_kors[0].trim();
        $('right_2_txt').innerText = selected_kors[1].trim();
        $('right_3_txt').innerText = selected_kors[2].trim();
        $('right_4_txt').innerText = selected_kors[3].trim();
        $('left_1_txt').innerText = selected_esps[0].trim();
        $('left_2_txt').innerText = selected_esps[1].trim();
        $('left_3_txt').innerText = selected_esps[2].trim();
        $('left_4_txt').innerText = selected_esps[3].trim();

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
    if (localStorage.quiz_count >= 10) { //TODO 임시로 10을 2로 바꿨음.
        window.location.href = "session-finish.html";
        return;
    }


    // /api/card-next.api
    //         userid, email, cookie:login_status, lang, course
    //         output: 
    //                quiz-card-url, 퀴즈 카드 유형을 랜덤으로 정해서 보내옴
    //                level,esp_txt,kor,eng,group,count,next-review-time, = myprgress.tsv파일의 한 라인임
    //                voice_img,voice_name,esp_txt.mp3 = esp_txt를 음성으로 읽어줄 캐릭터와 음성  
    var jsonStr = JSON.stringify({ email: email, lang: lang, course: course, esp_txt: esp_txt, score: "0", index: quiz_count });
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

const selected_color = '#03bf6b';
const default_color = '#49c0f8';
const wrong_color = '#ff5c58';
const disabled_color = '#dddddd';
var disabled_count = 0; //답을 맞출 때 마다 disabled_count를 1씩 증가시킨다.
var disabled = {};
var disabled_right = {};

function word_click(item) {
    // 지금 선택한 것이 처음이면 prev_item에 기억시키고 selected색깔로 바꾼다.
    if (localStorage.getItem("prev_item") == '') {
        localStorage.setItem("prev_item", item);
        $(item + '_border').style.borderColor = selected_color;
        $(item).style.backgroundColor = selected_color;
        if (item.indexOf("left") >= 0) {
            play_sound_esp($(item + '_txt').innerText);
        }
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

        $(item + '_border').style.borderColor = selected_color;
        $(item).style.backgroundColor = selected_color;
        localStorage.prev_item = item;

        if (item.indexOf("left") >= 0) {
            play_sound_esp($(item + '_txt').innerText);
            // play_sound_esp($(item + "_txt").innerText);
        } else if (prev_item.indexOf("left") >= 0) {
            play_sound_esp($(prev_item + '_txt').innerText);
            // play_sound_esp($(prev_item + "_txt").innerText);
        }

        //만약에 이전에 틀린 항목이 있으면 그것도 꺼버린다.
        wrong_prev_item = localStorage.getItem("wrong_prev_item");
        if (wrong_prev_item != "") {
            $(wrong_prev_item + '_border').style.borderColor = default_color;
            $(wrong_prev_item).style.backgroundColor = default_color;
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
        if (esp_txt.trim() == similar_words[i][0].trim() && kor_txt.trim() == similar_words[i][1].trim()) {
            matched = true;
        }
    }
    console.log(matched);
    //만약에 match되면 현재 아이템을 색깔을 selected로 바꾼다.
    if (matched) {
        $(item + '_border').style.borderColor = selected_color;
        $(item).style.backgroundColor = selected_color;

        // 1초 후에 item과 prev_item을 disable 시킨다.
        function disable_matched_items() {
            $(item + '_border').style.borderColor = disabled_color;
            $(item).style.backgroundColor = disabled_color;
            $(prev_item + '_border').style.borderColor = disabled_color;
            $(prev_item).style.backgroundColor = disabled_color;


            // 모두다 맞춰서 카드가 다 disabled로 바뀌었으면 continue 버튼을 켠다.
            disabled_count += 1;
            if (disabled_count >= 4) {
                $('btn_continue').disabled = false;
                $('btn_continue').style.color = "white";
                $('btn_continue').style.display = "block";
                $('continue_border').style.display = "block";
                // 맞추면 progress bar를 한 칸 진전시킨다.
                if (parseInt(localStorage.quiz_count) <= 10) {
                    max_cards = 11;
                    percent = Math.floor(((parseFloat(localStorage.quiz_count) + 2.0) / max_cards) * 100);
                    $('progress').style.width = percent + "%";
                }
            }
        }
        if (item.indexOf("left") >= 0) {
            disabled[item] = true;
            disabled_right[prev_item] = true;
            console.log(item + " disabled");
        }
        else if (prev_item.indexOf("left") >= 0) {
            disabled[prev_item] = true;
            disabled_right[item] = true;
            console.log(prev_item + " prev_disabled");
        }
        setTimeout(disable_matched_items, 1000);

        if (item.indexOf("left") >= 0) {
            play_sound_esp($(item + '_txt').innerText);
            // play_sound_esp($(item + "_txt").innerText);
        } else if (prev_item.indexOf("left") >= 0) {
            play_sound_esp($(prev_item + '_txt').innerText);
            // play_sound_esp($(prev_item + "_txt").innerText);
        }

        //prev_item을 초기화 한다.
        localStorage.prev_item = "";

        //만약에 이전에 틀린 항목이 있으면 그것도 꺼버린다.
        wrong_prev_item = localStorage.getItem("wrong_prev_item");
        if (wrong_prev_item != "") {
            $(wrong_prev_item + '_border').style.borderColor = default_color;
            $(wrong_prev_item).style.backgroundColor = default_color;
            localStorage.wrong_prev_item = "";
        }

        //해당 esp_txt 항목에 대해서 플러스 점수를 준다. 
        put_score(esp_txt, 1);
        return;
    }

    //매칭이 안되면 현재 아이템 색깔을 wrong색깔로 바꾼다.
    $(item + '_border').style.borderColor = wrong_color;
    $(item).style.backgroundColor = wrong_color;
    if (item.indexOf("left") >= 0) {
        play_sound_esp($(item + '_txt').innerText);
        // play_sound_esp($(item + "_txt").innerText);
    }

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

    display_message();
    // display_language_str();

    $('btn_quit').onclick = function () {
        window.location.href = "./user-courses.html";
    }

    $('btn_continue').onclick = click_continue;
    $('btn_continue').style.display = "none";
    $('continue_border').style.display = "none";

    //progress_bar를 현재 quiz_count에 맞게 적용한다.

    max_cards = 11;
    percent = Math.floor(((parseFloat(localStorage.quiz_count) + 1.0) / max_cards) * 100);
    $('progress').style.width = percent + "%";


    carditem = JSON.parse(localStorage.Carditem);
    get_similar_words(carditem);
    localStorage.setItem('prev_item', '');
    localStorage.setItem('wrong_prev_item', '');

    //처음에는 continue버튼이 눌러지지 않게 시작한다.
    $('btn_continue').disabled = true;
    $('btn_continue').style.color = "#03bf6b";

    $('right_1').onclick = function () { if (!("right_1" in disabled_right) && !is_playing) word_click('right_1'); };
    $('right_2').onclick = function () { if (!("right_2" in disabled_right) && !is_playing) word_click('right_2'); };
    $('right_3').onclick = function () { if (!("right_3" in disabled_right) && !is_playing) word_click('right_3'); };
    $('right_4').onclick = function () { if (!("right_4" in disabled_right) && !is_playing) word_click('right_4'); };
    $('left_1').onclick = function () {
        if (!("left_1" in disabled) && !is_playing) word_click('left_1');
        else if (!is_playing) {
            play_sound_esp($("left_1_txt").innerText);
        }
    };
    $('left_2').onclick = function () {
        if (!("left_2" in disabled) && !is_playing) word_click('left_2');
        else if (!is_playing) {
            play_sound_esp($("left_2_txt").innerText);
        }
    };
    $('left_3').onclick = function () {
        if (!("left_3" in disabled) && !is_playing) word_click('left_3');
        else if (!is_playing) {
            play_sound_esp($("left_3_txt").innerText);
        }
    };
    $('left_4').onclick = function () {
        if (!("left_4" in disabled) && !is_playing) word_click('left_4');
        else if (!is_playing) {
            play_sound_esp($("left_4_txt").innerText);
        }
    };
};


