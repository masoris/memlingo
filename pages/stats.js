function users_stats() {
    var jsonObj = {};
    var strdata = JSON.stringify(jsonObj);
    postAjaxRequest('/api/users_stats.api', strdata, function (response) {
        jsonObj = JSON.parse(response);
        console.log(response);
        contents = "<table border=1>";
        contents += "<tr>";
        contents += "<td>";
        contents += "login count";
        contents += "</td>";
        contents += "<td>";
        contents += jsonObj.stats.login.count;
        contents += "</td>";
        contents += "</tr>";
        contents += "<tr>";
        contents += "<td>";
        contents += "session start count";
        contents += "</td>";
        contents += "<td>";
        contents += jsonObj.stats.sessionstart.count;
        contents += "</td>";
        contents += "</tr>";
        contents += "<tr>";
        contents += "<td>";
        contents += "session finish count";
        contents += "</td>";
        contents += "<td>";
        contents += jsonObj.stats.sessionfinish.count;
        contents += "</td>";
        contents += "</tr>";
        contents += "</table>";
        $("contents").innerHTML = contents;

    }, function (errcode) { });
}

window.onload = function () {

    $("users").onclick = users_stats;
};
