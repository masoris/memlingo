function $(id) {
    return document.getElementById(id);
}



var is_playing = false;
function play_sound_url(url) {
    try {
        var email = localStorage.getItem("email");
        var audio = new Audio("/api/playsound.api?email=" + email + "&voice_esp_txt_mp3=" + url + "&t=" + new Date().getTime());
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

var voices = ["male1", "male2", "female1", "female2", "ludoviko"];
function play_sound_esp(esp_txt) {
    // Fisher-Yates Shuffle 알고리즘
    for (let i = voices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [voices[i], voices[j]] = [voices[j], voices[i]];
    }

    // for (i = 0; i < voices.length; i++) {
    var email = localStorage.getItem("email");
    url = "/api/playsound.api?email=" + email + "&voice_esp_txt_mp3=" + voices[0] + "/" + esp_txt + ".mp3" + "&t=" + new Date().getTime();
    try {
        // if (is_playing == true) {
        // break;
        // }
        let audio = new Audio(url);
        audio.addEventListener('ended', function () {
            audio.currentTime = 0;
            is_playing = false;
            if ($("btn_listen_continue") != null) $("btn_listen_continue").disabled = false;
            if ($("btn_continue") != null) $("btn_continue").disabled = false;
        });
        audio.play();
        is_playing = true;
        if ($("btn_listen_continue") != null) $("btn_listen_continue").disabled = true;
        if ($("btn_continue") != null) $("btn_continue").disabled = true;
    } catch (e) {
        is_playing = false;
        if ($("btn_listen_continue") != null) $("btn_listen_continue").disabled = false;
        if ($("btn_continue") != null) $("btn_continue").disabled = false;
        console.log('Failed to load audio file.');
    }
    // }
}


function play_sound_esp_voice(esp_txt, voice) {
    var email = "hiongun@gmail.com";
    var url = "/api/playsound.api?email=" + email + "&voice_esp_txt_mp3=" + voice + "/" + esp_txt + ".mp3" + "&t=" + new Date().getTime();
    try {
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

function play_sound_esp_next_url(esp_txt, next_url) {
    // Fisher-Yates Shuffle 알고리즘
    for (let i = voices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [voices[i], voices[j]] = [voices[j], voices[i]];
    }
    is_playing = false;
    for (i = 0; i < voices.length; i++) {
        var email = localStorage.getItem("email");
        var mp3_url = "/api/playsound.api?email=" + email + "&voice_esp_txt_mp3=" + voices[i] + "/" + esp_txt + ".mp3" + "&t=" + new Date().getTime();
        try {
            if (is_playing == true) {
                break;
            }
            let audio = new Audio(mp3_url);
            audio.addEventListener('ended', function () {
                audio.currentTime = 0;
                is_playing = false;
                if ($("btn_continue") != null) {
                    $("btn_continue").disabled = false;
                }
                if ($("btn_listen_continue") != null) {
                    $("btn_listen_continue").disabled = false;
                }
                if (next_url != "") {
                    window.location.href = next_url;
                }
            });
            audio.play();
            is_playing = true;
            if ($("btn_continue") != null) {
                $("btn_continue").disabled = true;
            }
            if ($("btn_listen_continue") != null) {
                $("btn_listen_continue").disabled = true;
            }
        } catch (e) {
            is_playing = false;
            if ($("btn_continue") != null)
                $("btn_continue").disabled = false;
            if ($("btn_listen_continue") != null) {
                $("btn_listen_continue").disabled = false;
            }
            if (next_url != "") {
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


function get_course_info(update_course_info) {
    const email = localStorage.getItem("email");
    const lang = localStorage.getItem("lang");

    var jsonStr = JSON.stringify({ email: email, lang: lang });
    postAjaxRequest('/api/get_course_info.api', jsonStr, function (responseJSONStr) {
        responseObj = JSON.parse(responseJSONStr);

        if (responseObj['resp'] == "OK") {
            localStorage.setItem('user_courses', JSON.stringify(responseObj['user_courses']));
            update_course_info();
        } else {
            alert('Error' + responseJSONStr);
        }
        console.log(responseObj);
    }, function (status, responseText) {
        alert(responseText);
        console.error('Error:', status);
        console.error(responseText);
    });
}

// var lang_str = {
//     "ko-kr": {
//         "Listen and fill blanks.": "듣고 빈칸을 채우세요.",
//         "Match correct pairs.": "짝을 맞추세요.",
//         "Choose the level how you feel about this.": "이것이 쉽나요? 어렵나요?",
//         "Select what you hear.": "들은 것을 선택하세요.",
//         "Select correct one.": "맞는 것을 선택하세요.",
//         "You have just learned these words.": "방금 학습하신 목록입니다.",
//     }
// }

// function display_language_str() {
//     var lang = localStorage.getItem("lang");
//     // 모든 span 요소 가져오기
//     var spanElements = document.getElementsByTagName("span");

//     // 가져온 span 요소를 반복하여 작업 수행
//     for (var i = 0; i < spanElements.length; i++) {
//         var span = spanElements[i];
//         var txt = span.innerText;
//         console.log(txt);
//         if (lang in lang_str) {
//             if (txt in lang_str[lang]) {
//                 span.innerText = lang_str[lang][txt];
//             }
//         }

//     }
// }


var lang_msgs = {
    "ko-kr": {
        "type_e-mail": "이메일 주소를 입력해 주세요.",
        "type_e-mail_again": "이메일 주소를 한 번 더 입력해 주세요.",
        "type_e-mail_twice": "이메일을 두 번 입력해주세요.",
        "listen_and_fill": "듣고 빈칸을 채우세요.",
        "match_correct": "짝을 맞추세요.",
        "choose_the_level": "이것이 쉽나요? 어렵나요?",
        "select_what_you_hear": "들어보고 선택하세요.",
        "select_correct_one": "맞는 것을 선택하세요.",
        "learned_these_words": "방금 학습하신 목록입니다.",
        "span_learn_by_examples": "예제를 통한 에스페란토 학습",
        "Btn_Start_learning": "학습 시작하기",
        "btn_continue": "다음",
        "btn_listen_continue": "듣고 다음으로",
        "btn_listen": "들어보기",
        "btn_hard": "어려워요",
        "btn_easy": "쉬워요",
        "btn_login": "로그인",
        "Btn_StartA": "학습시작",
        "Btn_StartB": "학습시작",
        "Btn_StartC": "학습시작",
        "Btn_logout": "로그아웃",
        "wordsA": "전체 항목 수",
        "words_to_reviewA": "복습 필요 항목",
        "familiarA": "익숙해진 항목",
        "masteredA": "마스터한 항목",
        "progressA": "진도율",
        "pointsA": "누적 점수",
        "wordsB": "전체 항목 수",
        "words_to_reviewB": "복습 필요 항목",
        "familiarB": "익숙해진 항목",
        "masteredB": "마스터한 항목",
        "progressB": "진도율",
        "pointsB": "누적 점수",
        "wordsC": "전체 항목 수",
        "words_to_reviewC": "복습 필요 항목",
        "familiarC": "익숙해진 항목",
        "masteredC": "마스터한 항목",
        "progressC": "진도율",
        "pointsC": "누적 점수",
    },
    "zh-tw": {
        "type_e-mail": "請輸入電子郵件地址。",
        "type_e-mail_again": "請再輸入一次電子郵件地址。",
        "type_e-mail_twice": "請輸入兩次電子郵件",
        "listen_and_fill": "聽完後填滿空格。",
        "match_correct": "請配對.",
        "choose_the_level": "這容易嗎? 很難嗎？",
        "select_what_you_hear": "請聽後選擇。",
        "select_correct_one": "請選擇正確的。",
        "learned_these_words": " 這是您剛剛學習的列表。",
        "span_learn_by_examples": "通過例題學習世界語",
        "Btn_Start_learning": "開始學習",
        "btn_continue": "下一個",
        "btn_listen_continue": "聽完之後",
        "btn_listen": " 聽",
        "btn_hard": "好難",
        "btn_easy": "簡單",
        "btn_login": "登錄",
        "Btn_StartA": "學習開始",
        "Btn_StartB": "學習開始",
        "Btn_StartC": "學習開始",
        "Btn_logout": "註銷",
        "wordsA": "總項目數",
        "words_to_reviewA": " 複習項目",
        "familiarA": "熟悉的項目",
        "masteredA": "掌握的項目",
        "progressA": "進度率",
        "pointsA": "累計分數",
        "wordsB": "總項目數",
        "words_to_reviewB": " 複習項目",
        "familiarB": "已熟悉的項目",
        "masteredB": "掌握的項目",
        "progressB": "進度率",
        "pointsB": "累計分數",
        "wordsC": "總項目數",
        "words_to_reviewC": "複習項目",
        "familiarC": "熟悉的項目",
        "masteredC": "掌握的項目",
        "progressC": "進度率",
        "pointsC": "累計分數",
    },
    "zh-cn": {
        "type_e-mail": "请输入电子邮件地址。",
        "type_e-mail_again": "请再输入一次电子邮件地址。",
        "type_e-mail_twice": "请输入两次电子邮件",
        "listen_and_fill": "听完后填满空格。",
        "match_correct": "请配对.",
        "choose_the_level": "这容易吗? 很难吗？",
        "select_what_you_hear": "请听后选择。",
        "select_correct_one": "请选择正确的。",
        "learned_these_words": "这是您刚刚学习的列表。",
        "span_learn_by_examples": "通过例题学习世界语",
        "Btn_Start_learning": "开始学习",
        "btn_continue": "下一个",
        "btn_listen_continue": "听完之后",
        "btn_listen": "听",
        "btn_hard": "好难",
        "btn_easy": "简单",
        "btn_login": "登录",
        "Btn_StartA": "学习开始",
        "Btn_StartB": "学习开始",
        "Btn_StartC": "学习开始",
        "Btn_logout": "注销",
        "wordsA": "总项目数",
        "words_to_reviewA": " 复习项目",
        "familiarA": "熟悉的项目",
        "masteredA": "掌握的项目",
        "progressA": "进度率",
        "pointsA": "累计分数",
        "wordsB": "总项目数",
        "words_to_reviewB": " 复习项目",
        "familiarB": "已熟悉的项目",
        "masteredB": "掌握的项目",
        "progressB": "进度率",
        "pointsB": "累计分数",
        "wordsC": "总项目数",
        "words_to_reviewC": "复习项目",
        "familiarC": "熟悉的项目",
        "masteredC": "掌握的项目",
        "progressC": "进度率",
        "pointsC": "累计分数"
    },
    "ja-jp": {
        "type_e-mail": "メールアドレスを入力してください。",
        "type_e-mail_again": "メールアドレスをもう一度入力してください。",
        "type_e-mail_twice": "Eメールを二度入力してください。",
        "listen_and_fill": "聞いて空欄を埋めてください。",
        "match_correct": "ペアを組んでください。",
        "choose_the_level": "これが簡単ですか？ 難しいですか？",
        "select_what_you_hear": "聞いてみて選択してください。",
        "select_correct_one": "正しいものを選択してください。",
        "learne d_these_words": "先ほど学習したリストです。",
        "span_learn_by_examples": "例題によるエスペラント学習",
        "Btn_Start_learning": "学習を始める",
        "btn_continue": "次",
        "btn_listen_continue": "聞いてから次へ",
        "btn_listen": "聞いてみる",
        "btn_hard": "難しいです",
        "btn_easy": "簡単です",
        "btn_login": "ログイン",
        "Btn_StartA": "学習開始",
        "Btn_StartB": "学習開始",
        "Btn_StartC": "学習開始",
        "Btn_logout": "ログアウト",
        "wordsA": "全項目数",
        "words_to_reviewA": "復習必要項目",
        "familiarA": "慣れた項目",
        "masteredA": "マスターな項目",
        "progressA": "進度率",
        "pointsA": "累積点数",
        "wordsB": "全項目数",
        "words_to_review B": "復習必要項目",
        "familiarB": "慣れた項目",
        "mastered B": "マスターな項目",
        "progressB": "進度率",
        "pointsB": "累積点数",
        "wordsC": "全項目数",
        "words_to_reviewC": "復習必要項目",
        "familiarC": "慣れた項目",
        "masteredC": "マスターな項目",
        "progressC": "進度率",
        "pointsC": "累積点数",
    },
    "en-us": {
        "type_e-mail": "Type in your e-mail adress.",
        "type_e-mail_again": "Type in your e-mail adress again.",
        "type_e-mail_twice": "Enter your e-mail twice.",
        "listen_and_fill": "Listen and fill blanks.",
        "match_correct": "Match correct pairs.",
        "choose_the_level": "Choose the level how you feel about this.",
        "select_what_you_hear": "Select what you hear.",
        "select_correct_one": "Select correct one.",
        "learned_these_words": "You have just learned these words.",
        "span_learn_by_examples": "Learn Esperanto by Examples",
        "Btn_Start_learning": "Start Learning",
        "btn_continue": "Continue",
        "btn_listen_continue": "Listen and Continue",
        "btn_listen": "Listen",
        "btn_hard": "Hard for me",
        "btn_easy": "Easy to me",
        "btn_login": "Login",
        "Btn_StartA": "Start Learning",
        "Btn_StartB": "Start Learning",
        "Btn_StartC": "Start Learning",
        "Btn_logout": "Logout",
        "wordsA": "Words",
        "words_to_reviewA": "Words to review",
        "familiarA": "Familiar",
        "masteredA": "Mastered",
        "progressA": "Progress",
        "pointsA": "Points",
        "wordsB": "Words",
        "words_to_reviewB": "Words to review",
        "familiarB": "Familiar",
        "masteredB": "Mastered",
        "progressB": "Progress",
        "pointsB": "Points",
        "wordsC": "Words",
        "words_to_reviewC": "Words to review",
        "familiarC": "Familiar",
        "masteredC": "Mastered",
        "progressC": "Progress",
        "pointsC": "Points",
    }
};



function display_msg(item, field, msg_id) {
    var lang = localStorage.lang;
    if ($(item) != null) {
        var msg = "";
        if (lang in lang_msgs) {
            if (msg_id in lang_msgs[lang]) {
                msg = lang_msgs[lang][msg_id];
            }
            else {
                msg = lang_msgs["en-us"][msg_id];
            }
        }
        else {
            msg = lang_msgs["en-us"][msg_id];
        }

        if (field == "placeholder") $(item).placeholder = msg;
        if (field == "innerText") $(item).innerText = msg;
        if (field == "value") $(item).value = msg;
    }
}

function display_message() {
    // var lang = localStorage.lang;
    // alert("display_msg" + lang);
    display_msg("email1", "placeholder", "type_e-mail");
    display_msg("email2", "placeholder", "type_e-mail_again");
    display_msg("span_message_email_twice", "innerText", "type_e-mail_twice");
    display_msg("span_learn_by_examples", "innerText", "span_learn_by_examples");
    display_msg("Btn_Start_learning", "value", "Btn_Start_learning");
    display_msg("btn_continue", "value", "btn_continue");
    display_msg("match_correct", "innerText", "match_correct");
    display_msg("select_what_you_hear", "innerText", "select_what_you_hear");
    display_msg("btn_listen_continue", "value", "btn_listen_continue");
    display_msg("btn_listen", "value", "btn_listen");
    display_msg("select_what_you_hear", "innerText", "select_what_you_hear");
    display_msg("select_correct_one", "innerText", "select_correct_one");
    display_msg("choose_the_level", "innerText", "choose_the_level");
    display_msg("btn_hard", "value", "btn_hard");
    display_msg("btn_easy", "value", "btn_easy");
    display_msg("listen_and_fill", "innerText", "listen_and_fill");
    display_msg("learned_these_words", "innerText", "learned_these_words");
    display_msg("btn_login", "value", "btn_login");
    display_msg("Btn_StartA", "value", "Btn_StartA");
    display_msg("Btn_StartB", "value", "Btn_StartB");
    display_msg("Btn_StartC", "value", "Btn_StartC");
    display_msg("Btn_logout", "value", "Btn_logout");
    display_msg("wordsA", "innerText", "wordsA");
    display_msg("words_to_reviewA", "innerText", "words_to_reviewA");
    display_msg("familiarA", "innerText", "familiarA");
    display_msg("masteredA", "innerText", "masteredA");
    display_msg("progressA", "innerText", "progressA");
    display_msg("pointsA", "innerText", "pointsA");
    display_msg("wordsB", "innerText", "wordsB");
    display_msg("words_to_reviewB", "innerText", "words_to_reviewB");
    display_msg("familiarB", "innerText", "familiarB");
    display_msg("masteredB", "innerText", "masteredB");
    display_msg("progressB", "innerText", "progressB");
    display_msg("pointsB", "innerText", "pointsB");
    display_msg("wordsC", "innerText", "wordsC");
    display_msg("words_to_reviewC", "innerText", "words_to_reviewC");
    display_msg("familiarC", "innerText", "familiarC");
    display_msg("masteredC", "innerText", "masteredC");
    display_msg("progressC", "innerText", "progressC");
    display_msg("pointsC", "innerText", "pointsC");

    // if ($('lang').value == 'ko-kr') {
    //     $('email1').placeholder = "이메일 주소를 입력해 주세요.";
    //     $('email2').placeholder = "이메일 주소를 한 번 더 입력해 주세요.";
    //     $('span_message_email_twice').innerText = "이메일을 두 번 입력해주세요.";
    // }
    // else {
    //     $('email1').placeholder = "Type in your e-mail adress.";
    //     $('email2').placeholder = "Type in your e-mail adress again.";
    //     $('span_message_email_twice').innerText = "Enter your e-mail twice.";
    // }
}

function parentBgColor(color) {
    try {
        window.parent.postMessage({
            'func': 'parentFunc',
            'message': color
        }, "http://memlingo.esperanto.or.kr");
        // Use target origin instead of *
    }
    catch (e) {
        alert(e);
    }
}