var likes = [];

function like_unlike(i) {
    likes[i].like = (likes[i].like) ? false : true;
    var json = { email: $m("email"), lang: likes[i].lang, course: likes[i].course, esp: likes[i].esp, kor: likes[i].kor, eng: likes[i].eng, like: likes[i].like };

    postAjax("/api2/put-like.api", json, function (obj, text) {
        console.log(text);
        if (obj.resp != "OK") {
            alert(obj.msg);
            return;
        }

        if (likes[i].like == true) {
            $("LIKE_" + i).src = "img/frame-1@2x.png";
        } else {
            $("LIKE_" + i).src = "img/frame@2x.png";
        }
    });
}

function load_like_list() {
    var json = { email: $m("email") };
    postAjax("/api2/like-list.api", json, function (obj, text) {
        console.log(text);
        if (obj.resp != "OK") {
            alert(obj.msg);
            return;
        }
        likes = obj.likes;
        $("like_list").innerHTML = "";
        if (likes.length == 0) {
            var html = "<br><br>&nbsp;&nbsp;&nbsp;Vi elektis neniun vorton por memorado.";
            $("like_list").innerHTML = html;
        }
        for (var i = 0; i < likes.length; i++) {
            var like = likes[i];
            var html = item;
            html = html.replace("$SPEAKER", "SPEAKER_" + i);
            html = html.replace("$ESP", like.esp);
            html = html.replace("$KOR", like.kor);
            html = html.replace("$ENG", like.eng);
            html = html.replace("$LIKE", "LIKE_" + i);

            $("like_list").innerHTML += html;
        }
        for (var i = 0; i < likes.length; i++) {
            $("SPEAKER_" + i).onclick = function () {
                var ii = this.id.split("_")[1];
                play_sound_esp(likes[ii].esp);
            }

            $("LIKE_" + i).onclick = function () {
                var ii = this.id.split("_")[1];
                like_unlike(ii);
            }

            if (likes[i].like == true) {
                $("LIKE_" + i).src = "img/frame-1@2x.png";
            } else {
                $("LIKE_" + i).src = "img/frame@2x.png";
            }
        }
    });
}

window.onload = function () {
    if (localStorage.getItem('login_status') != 'success') {
        window.location.href = "./login.html";
        return;
    }

    load_like_list();
    display_message();
}