
var cur_course = "";
var page_size = 20;
var wordlist = [];

var L_page = 0;
function prev_L() {
    if (L_page == 0) { return; }
    L_page -= 1;
    display_L();
}

function next_L() {
    if (L_page * page_size >= L_course.length) { return; }
    L_page += 1;
    display_L();
}

function display_L() {
    cur_course = "L";
    wordlist = [];
    $("contents").innerHTML = "L_page: " + L_page;
    $("contents").innerHTML += "<br><a onclick='prev_L()'>[prev]</a>";
    $("contents").innerHTML += " <a onclick='next_L()'>[next]</a>";
    for (i = (L_page * page_size); i < L_course.length && i < ((L_page + 1) * page_size); i++) {
        $("contents").innerHTML += "<br><a onclick='setitem(this)'>" + L_course[i] + "</a><br>&nbsp;<span id='L_" + i + "_span'></span>";
        wordlist.push(L_course[i]);
    }
    display_voices(wordlist, "L");
    $("contents").innerHTML += "L_page: " + L_page;
    $("contents").innerHTML += "<br><a onclick='prev_L()'>[prev]</a>";
    $("contents").innerHTML += " <a onclick='next_L()'>[next]</a>";
}


var H_page = 0;
function prev_H() {
    if (H_page == 0) { return; }
    H_page -= 1;
    display_H();
}

function next_H() {
    if (H_page * page_size >= H_course.length) { return; }
    H_page += 1;
    display_H();
}

function display_H() {
    cur_course = "H";
    wordlist = [];
    $("contents").innerHTML = "H_page: " + H_page;
    $("contents").innerHTML += "<br><a onclick='prev_H()'>[prev]</a>";
    $("contents").innerHTML += " <a onclick='next_H()'>[next]</a>";
    for (i = (H_page * page_size); i < H_course.length && i < ((H_page + 1) * page_size); i++) {
        $("contents").innerHTML += "<br><a onclick='setitem(this)'>" + H_course[i] + "</a><br>&nbsp;<span id='H_" + i + "_span'></span>";
        wordlist.push(H_course[i]);
    }
    display_voices(wordlist, "H");
    $("contents").innerHTML += "H_page: " + H_page;
    $("contents").innerHTML += "<br><a onclick='prev_H()'>[prev]</a>";
    $("contents").innerHTML += " <a onclick='next_H()'>[next]</a>";
}



var K_page = 0;
function prev_K() {
    if (K_page == 0) { return; }
    K_page -= 1;
    display_K();
}

function next_K() {
    if (K_page * page_size >= K_course.length) { return; }
    K_page += 1;
    display_K();
}

function display_K() {
    cur_course = "K";
    wordlist = [];
    $("contents").innerHTML = "K_page: " + K_page;
    $("contents").innerHTML += "<br><a onclick='prev_K()'>[prev]</a>";
    $("contents").innerHTML += " <a onclick='next_K()'>[next]</a>";
    for (i = (K_page * page_size); i < L_course.length && i < ((K_page + 1) * page_size); i++) {
        $("contents").innerHTML += "<br><a onclick='setitem(this)'>" + K_course[i] + "</a><br>&nbsp;<span id='K_" + i + "_span'></span>";
        wordlist.push(K_course[i]);
    }
    display_voices(wordlist, "K");
    $("contents").innerHTML += "K_page: " + K_page;
    $("contents").innerHTML += "<br><a onclick='prev_K()'>[prev]</a>";
    $("contents").innerHTML += " <a onclick='next_K()'>[next]</a>";
}



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
        $("contents").innerHTML += "<br><a onclick='setitem(this)'>" + A_course[i] + "</a><br>&nbsp;<span id='A_" + i + "_span'></span>";
        wordlist.push(A_course[i]);
    }
    display_voices(wordlist, "A");
    $("contents").innerHTML += "A_page: " + A_page;
    $("contents").innerHTML += "<br><a onclick='prev_A()'>[prev]</a>";
    $("contents").innerHTML += " <a onclick='next_A()'>[next]</a>";
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
        $("contents").innerHTML += "<br><a onclick='setitem(this)'>" + B_course[i] + "</a><br>&nbsp;<span id='B_" + i + "_span'></span>";
        wordlist.push(B_course[i]);
    }
    display_voices(wordlist, "B");
    $("contents").innerHTML += "B_page: " + B_page;
    $("contents").innerHTML += "<br><a onclick='prev_B()'>[prev]</a>";
    $("contents").innerHTML += " <a onclick='next_B()'>[next]</a>";
}



var C_page = 0;
function prev_C() {
    if (C_page == 0) { return; }
    C_page -= 1;
    display_C();
}

function next_C(page) {
    if (C_page * page_size >= C_course.length) { return; }
    if (page == -1) {
        C_page += 1;
    }
    else {
        C_page = page;
    }
    display_C();
}

function display_C() {
    wordlist = [];
    $("contents").innerHTML = "C_page: " + C_page;
    $("contents").innerHTML += "<br><a onclick='prev_C()'>[prev]</a>";
    $("contents").innerHTML += " <a onclick='next_C(-1)'>[next]</a>";
    for (page = 0; page * page_size * 3 < C_course.length; page++) {
        $("contents").innerHTML += " <a onclick='next_C(" + (page * 3) + ")'>[" + (page * 3) + "]</a>";
    }
    for (i = (C_page * page_size); i < C_course.length && i < ((C_page + 1) * page_size); i++) {
        $("contents").innerHTML += "<br><a id='" + i + "' onclick='setitem(this)'>" + C_course[i] + "</a><br>&nbsp;<font size='-2'><span id='C_" + i + "_span'></span></font>";
        wordlist.push(C_course[i]);
    }
    display_voices(wordlist, "C");
}

function click_button(item) {
    // alert(item.id);
    var cmd_which_i_voice = item.id.split('_');
    var which = cmd_which_i_voice[1];
    var i = cmd_which_i_voice[2];
    var esp_txt = "";
    if (which == "A") {
        esp_txt = A_course[i];
    }
    else if (which == "B") {
        esp_txt = B_course[i];
    }
    else if (which == "L") {
        esp_txt = L_course[i];
    }
    else if (which == "H") {
        esp_txt = H_course[i];
    }
    else if (which == "K") {
        esp_txt = K_course[i];
    }
    else {
        esp_txt = C_course[i];
    }
    // alert(esp_txt);
    var voice = cmd_which_i_voice[3].replace("new", "");
    var cmd = cmd_which_i_voice[0];
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

function search() {
    $("contents").innerHTML = "";
    word = prompt("Search Word:");

    words = [];
    for (i = 0; i < L_course.length; i++) {
        if (L_course[i].indexOf(word) >= 0) {
            words.push(L_course[i]);
        }
    }
    if (words.length > 0) {
        for (i = 0; i < L_course.length; i++) {
            for (j = 0; j < words.length; j++) {
                if (L_course[i] == words[j]) {
                    $("contents").innerHTML += "<br><a onclick='setitem(this)'>" + L_course[i] + "</a><br>&nbsp;<span id='L_" + i + "_span'></span>";
                }
            }
        }
        display_voices(words, "L");
    }

    words = [];
    for (i = 0; i < H_course.length; i++) {
        if (H_course[i].indexOf(word) >= 0) {
            words.push(H_course[i]);
        }
    }
    if (words.length > 0) {
        for (i = 0; i < H_course.length; i++) {
            for (j = 0; j < words.length; j++) {
                if (H_course[i] == words[j]) {
                    $("contents").innerHTML += "<br><a onclick='setitem(this)'>" + H_course[i] + "</a><br>&nbsp;<span id='H_" + i + "_span'></span>";
                }
            }
        }
        display_voices(words, "H");
    }


    words = [];
    for (i = 0; i < K_course.length; i++) {
        if (K_course[i].indexOf(word) >= 0) {
            words.push(K_course[i]);
        }
    }
    if (words.length > 0) {
        for (i = 0; i < K_course.length; i++) {
            for (j = 0; j < words.length; j++) {
                if (K_course[i] == words[j]) {
                    $("contents").innerHTML += "<br><a onclick='setitem(this)'>" + K_course[i] + "</a><br>&nbsp;<span id='K_" + i + "_span'></span>";
                }
            }
        }
        display_voices(words, "K");
    }

    words = [];
    for (i = 0; i < A_course.length; i++) {
        if (A_course[i].indexOf(word) >= 0) {
            words.push(A_course[i]);
        }
    }
    if (words.length > 0) {
        for (i = 0; i < A_course.length; i++) {
            for (j = 0; j < words.length; j++) {
                if (A_course[i] == words[j]) {
                    $("contents").innerHTML += "<br><a onclick='setitem(this)'>" + A_course[i] + "</a><br>&nbsp;<span id='A_" + i + "_span'></span>";
                }
            }
        }

        // alert(words.length);
        display_voices(words, "A");
    }


    words = [];
    for (i = 0; i < B_course.length; i++) {
        if (B_course[i].indexOf(word) >= 0) {
            words.push(B_course[i]);
        }
    }
    if (words.length > 0) {
        for (i = 0; i < B_course.length; i++) {
            for (j = 0; j < words.length; j++) {
                if (B_course[i] == words[j]) {
                    $("contents").innerHTML += "<br><a onclick='setitem(this)'>" + B_course[i] + "</a><br>&nbsp;<span id='B_" + i + "_span'></span>";
                }
            }
        }

        // alert(words.length);
        display_voices(words, "B");
    }

    words = [];
    for (i = 0; i < C_course.length; i++) {
        if (C_course[i].indexOf(word) >= 0) {
            words.push(C_course[i]);
        }
    }
    if (words.length > 0) {
        for (i = 0; i < C_course.length; i++) {
            for (j = 0; j < words.length; j++) {
                if (C_course[i] == words[j]) {
                    $("contents").innerHTML += "<br><a onclick='setitem(this)'>" + C_course[i] + "</a><br>&nbsp;<span id='C_" + i + "_span'></span>";
                }
            }
        }

        // alert(words.length);
        display_voices(words, "C");
    }
}

function display_voices(wordlist, which) {
    cur_course = which;
    // alert(wordlist[0]);
    jsonObj = { wordlist: wordlist };
    strdata = JSON.stringify(jsonObj);
    postAjaxRequest('/tts/get_voices.api', strdata, function (response) {
        jsonObj = JSON.parse(response);
        word_voice_pairs = jsonObj.word_voice_pairs;
        // alert(word_voice_pairs.length);
        // alert(word_voice_pairs[0]);

        for (word_voice_pair of word_voice_pairs) {
            word = word_voice_pair[0];
            // alert(word);
            voice = word_voice_pair[1];
            if (voice == "") {
                continue;
            }

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
            else if (which == "L") {
                ABC_course = L_course;
            }
            else if (which == "H") {
                ABC_course = H_course;
            }
            else if (which == "K") {
                ABC_course = K_course;
            }
            for (i = 0; i < ABC_course.length; i++) {
                if (word == ABC_course[i]) {
                    found_i = i;
                    break;
                }
            }
            if (found_i == -1) {
                // alert("[" + word + "]");
                return;
            }
            if ($(which + "_" + found_i + "_span") == null) alert(found_i);
            //voice에 여러 목소리가 콤마로 묶여서 온다.
            voices = voice.split(",");
            for (i = 0; i < voices.length; i++) {
                voice = voices[i];
                if (voice == "") {
                    continue;
                }
                $(which + "_" + found_i + "_span").innerHTML += "<input type='button' class='Listen' onclick='click_button(this)' id='listen_" + which + "_" + found_i + "_" + voice + "' value='Listen " + voice + "'>";
                $(which + "_" + found_i + "_span").innerHTML += "<input type='button' class='Delete' onclick='click_button(this)' id='delete_" + which + "_" + found_i + "_" + voice + "' value='Delete " + voice + "'><br>";
            }
            // if (word == "bedaŭrinde") alert(voice);

        }
    }, function (errcode) { });
}


window.onload = function () {
    L_course_map = {};
    for (i = 0; i < L_course.length; i++) {
        if (L_course[i] in L_course_map) {
            console.log(L_course[i]);
        }
        else {
            L_course_map[L_course[i]] = true;
        }
    }

    H_course_map = {};
    for (i = 0; i < H_course.length; i++) {
        if (H_course[i] in H_course_map) {
            console.log(H_course[i]);
        }
        else {
            H_course_map[H_course[i]] = true;
        }
    }

    K_course_map = {};
    for (i = 0; i < K_course.length; i++) {
        if (K_course[i] in K_course_map) {
            console.log(K_course[i]);
        }
        else {
            K_course_map[K_course[i]] = true;
        }
    }

    A_course_map = {};
    for (i = 0; i < A_course.length; i++) {
        if (A_course[i] in A_course_map) {
            console.log(A_course[i]);
        }
        else {
            A_course_map[A_course[i]] = true;
        }
    }

    B_course_map = {};
    for (i = 0; i < B_course.length; i++) {
        if (B_course[i] in B_course_map) {
            console.log(B_course[i]);
        }
        else {
            B_course_map[B_course[i]] = true;
        }
    }

    C_course_map = {};
    for (i = 0; i < C_course.length; i++) {
        if (C_course[i] in C_course_map) {
            console.log(C_course[i]);
        }
        else {
            C_course_map[C_course[i]] = true;
        }
    }

    $("A").onclick = display_A;
    $("B").onclick = display_B;
    $("C").onclick = display_C;
    $("L").onclick = display_L;
    $("H").onclick = display_H;
    $("K").onclick = display_K;
    $("search").onclick = search;
};
