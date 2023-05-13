function $(id) {
  return document.getElementById(id);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function onlogin_click() {
  const email1 = $('email1').value;
  const email2 = $('email2').value;
  const lang = $('lang').value;
  if (email1 != email2 || !isValidEmail(email1)) {
    alert("Email1 is not same with Email2 or Invalid Email format")
    return
  }

  // background-color: #4c5b75;

  var jsonStr = JSON.stringify({ email1: email1, email2: email2, lang: lang });
  postAjaxRequest('/api/login.api', jsonStr, function (responseJSONStr) {
    responseObj = JSON.parse(responseJSONStr);

    if (responseObj['resp'] == "OK") {
      //'resp': 'OK', 'user': email1[:email1.find('@')], 'email': email1, "lang": lang, "user_courses": user_courses
      localStorage.setItem('user', responseObj['user']);
      localStorage.setItem('email', responseObj['email']);
      localStorage.setItem('lang', responseObj['lang']);
      localStorage.setItem('user_courses', JSON.stringify(responseObj['user_courses']));
      // alert(getCookie('login_status'));
      window.location.href = "./user-courses.html";
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

function enable_disable_login_button() {
  if ($('email1').value == $('email2').value && isValidEmail($('email1').value)) {
    $('btn_login').disabled = false;
    $('btn_login').style.backgroundColor = "#4c5b75";
    $('btn_login').style.color = "white";
  } else {
    $('btn_login').disabled = true;
    $('btn_login').style.backgroundColor = "#03bf6b";
    $('btn_login').style.color = "#03bf6b";
  }
};

window.onload = function () {
  //최초에 login버튼을 누르지 못하는 상태로 초기화 한다.
  $('btn_login').disabled = true;
  $('btn_login').style.backgroundColor = "#03bf6b";
  $('btn_login').style.color = "#03bf6b";

  $('btn_login').onclick = onlogin_click;
  $('email2').onchange = function (event) {
    enable_disable_login_button()
  };
  $('email2').onkeydown = function (event) {
    enable_disable_login_button()
    if (event.key === "Enter") {
      onlogin_click();
      // alert($('email2').value);
    }
  };
  $('email2').onkeyup = function (event) {
    enable_disable_login_button()
  };
  $('email1').onchange = function (event) {
    enable_disable_login_button()
  };
  $('email1').onkeydown = function (event) {
    enable_disable_login_button()
    if (event.key === "Enter") {
      onlogin_click();
      // alert($('email2').value);
    }
  };
  $('email1').onkeyup = function (event) {
    enable_disable_login_button()
  };


  if (localStorage.getItem('email') != '') {
    $('email1').value = localStorage.getItem('email');
  }

  if (localStorage.getItem('lang') != '') {
    $('lang').value = localStorage.getItem('lang');
  }

};
