// Get-cookie 함수
function getCookie(name) {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1);
      }
    }
    return '';
  }
  
  // Set-cookie 함수
  function setCookie(name, value) {
    document.cookie = name + '=' + value + '; path=/';
  }