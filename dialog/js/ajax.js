function sendAjaxRequest(method, url, params, successCallback, errorCallback) {
  var xhr = new XMLHttpRequest();
  
  if (method == "GET") {
    xhr.open(method, url+"?"+params);
  } else {
    xhr.open(method, url);
  }
  
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onload = function() {
    if (xhr.status === 200) {
      successCallback(xhr.responseText);
    } else {
      errorCallback(xhr.status);
    }
  };
  xhr.onerror = function() {
    errorCallback(xhr.status);
  };
  xhr.send(params);
}

function sendGetRequest(url, params, successCallback, errorCallback) {
  sendAjaxRequest('GET', url, params, successCallback, errorCallback);
}

function sendPostRequest(url, params, successCallback, errorCallback) {
  sendAjaxRequest('POST', url, params, successCallback, errorCallback);
}


function postAjaxRequest(url, jsonStr, successCallback, errorCallback) {
  var xhr = new XMLHttpRequest();
  
  xhr.open('POST', url);
  
  
  xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  xhr.onload = function() {
    if (xhr.status === 200) {
      successCallback(xhr.responseText);
    } else {
      errorCallback(xhr.status);
    }
  };
  xhr.onerror = function() {
    errorCallback(xhr.status);
  };
  xhr.send(jsonStr);
}