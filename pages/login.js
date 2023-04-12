function $(id){
    return document.getElementById(id);
}

function onlogin_click(){
    const email1 = $('email1').value;
    const email2 = $('email2').value;
    var jsonStr = JSON.stringify({email1: email1, email2: email2});
    postAjaxRequest('/api/login.api', jsonStr, function(responseJSONStr) {
      response = JSON.parse(responseJSONStr);

      if (response['resp'] == "OK"){
        localStorage.setItem('user', response['user']);
        // alert(getCookie('login_status'));
        window.location.href = "./welcome.html";
      } else {
        alert('Error'+responseJSONStr);
      }
      console.log(response); 
    }, function(status) {
      alert(error);
      console.error('Error:', status);
    });
}

window.onload = function() {
    $('btn_login').onclick = onlogin_click;
    $('email2').onkeydown = function(event){
      if (event.key === "Enter"){
        onlogin_click();
        // alert($('email2').value);
      }
    };

};
