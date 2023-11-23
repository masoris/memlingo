var isRecording = false;

function click_btn_record() {
    if (isRecording) {
        //스탑 버튼을 누른다
        $("btn_record").value = "Tap to Speak";
        isRecording = false;
    }
    else {
        //레코딩 버튼을 누른다
        $("btn_record").value = "Recording... Tap to Stop";
        isRecording = true;
    }
}


window.onload = function () {
    if (localStorage.getItem('login_status') != 'success') {
        window.location.href = "./login.html";
        return;
    }

    // display_language_str();
    display_message();

    carditem = JSON.parse(localStorage.Carditem)

    $('btn_quit').onclick = function () {
        window.location.href = "./user-courses.html";
    }

    $('speaker').onclick = function () {
        play_sound_url(carditem.mp3_url);
    }

    $('btn_listen').onclick = function () {
        // play_sound_url(carditem.mp3_url);
        // $('esp_txt').innerText = carditem.esp_txt;
        // $('btn_record').disabled = false;
        // $('btn_record').style.color = "white";
        // $('rectangle_record').style.display = "block";
    }

    // $('rectangle_record').style.display = "none";


    // $('esp_txt').innerText = carditem.esp_txt;
    $('eng_txt').innerText = carditem.eng_txt;
    $('kor_txt').innerText = carditem.kor_txt;

    $('voice_img').src = carditem.voice_img_url;

    $('btn_record').onclick = click_btn_record;

    // $('btn_record').disabled = true;
    // $('btn_record').style.color = "#4c5b75";



    // 맞추면 progress bar를 한 칸 진전시킨다.
    max_cards = 11;
    percent = Math.floor(((parseFloat(localStorage.quiz_count) + 1.0) / max_cards) * 100);
    $('progress').style.width = percent + "%";
};


