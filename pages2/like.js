var likes = [];

function like_unlike(i) {
    likes[i].like = (likes[i].like) ? false : true;
    var json = { email: email, id: likes[i].id, like: likes[i].like };

    postAjax("/api2/like-unlike.api", json, function (obj, text) {
        console.log(text);
        if (obj.resp != "OK") {
            alert(obj.msg);
            return;
        }
    });
}

function load_like_list() {
    var json = { email: email };
    postAjax("/api2/like-list.api", json, function (obj, text) {
        console.log(text);
        if (obj.resp != "OK") {
            alert(obj.msg);
            return;
        }
        likes = obj.likes;
        $("like_list").innerHTML = "";
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
}