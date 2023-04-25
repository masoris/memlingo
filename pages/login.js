function $(id){
    return document.getElementById(id);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function onlogin_click(){
    const email1 = $('email1').value;
    const email2 = $('email2').value;
    const lang = $('lang').value;
    if (email1 != email2 || !isValidEmail(email1)){
      alert("Email1 is not same with Email2 or Invalid Email format")
      return
    }
    
    var jsonStr = JSON.stringify({email1: email1, email2: email2, lang: lang});
    postAjaxRequest('/api/login.api', jsonStr, function(responseJSONStr) {
      responseObj = JSON.parse(responseJSONStr);

      if (responseObj['resp'] == "OK"){
        //'resp': 'OK', 'user': email1[:email1.find('@')], 'email': email1, "lang": lang, "user_courses": user_courses
        localStorage.setItem('user', responseObj['user']);
        localStorage.setItem('email', responseObj['email']);
        localStorage.setItem('lang', responseObj['lang']);
        localStorage.setItem('user_courses', JSON.stringify(responseObj['user_courses']));
        // alert(getCookie('login_status'));
        window.location.href = "./user-courses.html";
      } else {
        alert('Error'+responseJSONStr);
      }
      console.log(responseObj); 
    }, function(status, responseText) {
      alert(responseText);
      console.error('Error:', status);
      console.error(responseText);
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

    if (localStorage.getItem('email') != ''){
      $('email1').value = localStorage.getItem('email');
    }

    if (localStorage.getItem('lang') != ''){
      $('lang').value = localStorage.getItem('lang');
    }

};
