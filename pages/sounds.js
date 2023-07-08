
var cur_course = "";
var page_size = 20;
var wordlist = [];
var A_page = 0;
function prev_A() {
    if (A_page == 0) { return; }
    A_page -= 1;
    display_A();
}

function next_A() {
    if (A_page * page_size >= A_course.length) { return; }
    A_page += 1;
    display_A();
}

function display_A() {
    cur_course = "A";
    wordlist = [];
    $("contents").innerHTML = "A_page: " + A_page;
    $("contents").innerHTML += "<br><a onclick='prev_A()'>[prev]</a>";
    $("contents").innerHTML += " <a onclick='next_A()'>[next]</a>";
    for (i = (A_page * page_size); i < A_course.length && i < ((A_page + 1) * page_size); i++) {
        $("contents").innerHTML += "<br><a id='" + i + "' onclick='setitem(this)'>" + A_course[i] + "</a><br>&nbsp;<span id='" + i + "_span'></span>";
        wordlist.push(A_course[i]);
    }
    display_voices(wordlist, "A");
}



var B_page = 0;
function prev_B() {
    if (B_page == 0) { return; }
    B_page -= 1;
    display_B();
}

function next_B() {
    if (B_page * page_size >= B_course.length) { return; }
    B_page += 1;
    display_B();
}

function display_B() {
    cur_course = "B";
    wordlist = [];
    $("contents").innerHTML = "B_page: " + B_page;
    $("contents").innerHTML += "<br><a onclick='prev_B()'>[prev]</a>";
    $("contents").innerHTML += " <a onclick='next_B()'>[next]</a>";
    for (i = (B_page * page_size); i < B_course.length && i < ((B_page + 1) * page_size); i++) {
        $("contents").innerHTML += "<br><a id='" + i + "' onclick='setitem(this)'>" + B_course[i] + "</a><br>&nbsp;<span id='" + i + "_span'></span>";
        wordlist.push(B_course[i]);
    }
    display_voices(wordlist, "B");
}



var C_page = 0;
function prev_C() {
    if (C_page == 0) { return; }
    C_page -= 1;
    display_C();
}

function next_C() {
    if (C_page * page_size >= C_course.length) { return; }
    C_page += 1;
    display_C();
}

function display_C() {
    cur_course = "C";
    wordlist = [];
    $("contents").innerHTML = "C_page: " + C_page;
    $("contents").innerHTML += "<br><a onclick='prev_C()'>[prev]</a>";
    $("contents").innerHTML += " <a onclick='next_C()'>[next]</a>";
    for (i = (C_page * page_size); i < C_course.length && i < ((C_page + 1) * page_size); i++) {
        $("contents").innerHTML += "<br><a id='" + i + "' onclick='setitem(this)'>" + C_course[i] + "</a><br>&nbsp;<span id='" + i + "_span'></span>";
        wordlist.push(C_course[i]);
    }
    display_voices(wordlist, "C");
}

function click_button(item) {
    // alert(item.id);
    var cmd_i_voice = item.id.split('_');
    var i = cmd_i_voice[1];
    var esp_txt = "";
    if (cur_course == "A") {
        esp_txt = A_course[i];
    }
    else if (cur_course == "B") {
        esp_txt = B_course[i];
    }
    else {
        esp_txt = C_course[i];
    }
    // alert(esp_txt);
    var voice = cmd_i_voice[2];
    var cmd = cmd_i_voice[0];
    if (cmd == 'listen') {
        play_sound_esp_voice(esp_txt, voice);
        return;
    }


    var jsonObj = { cmd: cmd, voice: voice, esp_txt: esp_txt };
    var strdata = JSON.stringify(jsonObj);
    postAjaxRequest('/tts/del_voice.api', strdata, function (response) {
        jsonObj = JSON.parse(response);
        word_voice_pairs = jsonObj.word_voice_pairs;
    }, function (errcode) { });
}

function display_voices(wordlist, which) {
    jsonObj = { wordlist: wordlist };
    strdata = JSON.stringify(jsonObj);
    postAjaxRequest('/tts/get_voices.api', strdata, function (response) {
        jsonObj = JSON.parse(response);
        word_voice_pairs = jsonObj.word_voice_pairs;

        for (word_voice_pair of word_voice_pairs) {
            word = word_voice_pair[0];
            voice = word_voice_pair[1];

            found_i = -1;
            if (which == "C") {
                ABC_course = C_course;
            }
            else if (which == "A") {
                ABC_course = A_course;
            }
            else if (which == "B") {
                ABC_course = B_course;
            }
            for (i = 0; i < ABC_course.length; i++) {
                if (word == ABC_course[i]) {
                    found_i = i;
                    break;
                }
            }
            if (found_i == -1) {
                alert("[" + word + "]");
            }
            if ($(found_i + "_span") == null) alert(found_i);
            //voice에 여러 목소리가 콤마로 묶여서 온다.
            voices = voice.split(",");
            for (i = 0; i < voices.length; i++) {
                voice = voices[i];
                if (voice == "") {
                    continue;
                }
                $(found_i + "_span").innerHTML += "<input type='button' onclick='click_button(this)' id='listen_" + found_i + "_" + voice + "' value='Listen " + voice + "'>";
                $(found_i + "_span").innerHTML += "<input type='button' onclick='click_button(this)' id='delete_" + found_i + "_" + voice + "' value='Delete " + voice + "'>";
            }
            // if (word == "bedaŭrinde") alert(voice);

        }
    }, function (errcode) { });
}


window.onload = function () {
    $("A").onclick = display_A;
    $("B").onclick = display_B;
    $("C").onclick = display_C;
};
