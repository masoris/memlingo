
function load_top_rankers() {
    var json = { email: $m("email") };
    postAjax("/api2/top-rankers.api", json, function (obj, text) {
        console.log(text);
        if (obj.resp != "OK") {
            alert(obj.msg);
            return;
        }
        thisweek = obj.thisweek;
        overall = obj.overall;

        for (var i = 0; i < thisweek.length; i++) {
            var user = thisweek[i];
            var html = item;
            html = html.replace("$IMG", user.img);
            html = html.replace("$UID", user.uid);
            html = html.replace("$THISWEEK", user.thisweek);
            html = html.replace("$TOTAL", user.total);

            $("thisweek").innerHTML += html;
        }

        for (var i = 0; i < overall.length; i++) {
            var user = overall[i];
            var html = item;
            html = html.replace("$IMG", user.img);
            html = html.replace("$UID", user.uid);
            html = html.replace("$THISWEEK", user.thisweek);
            html = html.replace("$TOTAL", user.total);

            $("overall").innerHTML += html;
        }

    });
}



window.onload = function () {
    load_top_rankers();
    display_message();
}