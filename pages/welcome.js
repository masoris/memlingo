function $(id){
    return document.getElementById(id);
}

function onlogout_click(){
  //alert('logout click');
    
    var jsonStr = "";
    postAjaxRequest('/api/logout.api', jsonStr, function(response) {
      //여기서 암묵적으로 쿠키가 들어옴 
      if (getCookie('login_status') != 'success'){
        //alert('Logout action is sucessfuly done');
      }
      window.location.href = "./login.html";
      console.log(response); 
    }, function(status) {
      setCookie('login_status', 'loged_out');
      setCookie('user', '');
      window.location.href = "./login.html";
      console.error('Error:', status);
    });
    
}

function saluton_click(){
  const audio = new Audio('./saluton.wav');
  audio.play();
  // 버튼을 diable 시킨다 
  $('btn_saluton').disabled = true;
  audio.addEventListener('ended', function() {
  // 버튼을 enable 시킨다 
  $('btn_saluton').disabled = false;  
  });
}

window.onload = function() {
    $('btn_logout').onclick = onlogout_click;
    $('btn_saluton').onclick = saluton_click;
    $('welcome_msg').onmouseover = function(){
      $('welcome_msg').innerHTML = "<B>" + $('welcome_msg').innerHTML + "</B>";
    };
    $('welcome_msg').onmouseout = function(){
      len = $('welcome_msg').innerHTML.length;
      $('welcome_msg').innerHTML =  $('welcome_msg').innerHTML.substring(3, len-4);
    };
    if (getCookie('login_status') != 'success'){
      alert('You are not currently loged in, please login first.');
      window.location.href = "./login.html";
      return;
    }
  $('welcome_msg').innerText = 'Welcome. You are now logged in as '+localStorage.getItem('user');

};

