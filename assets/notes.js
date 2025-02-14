var API_URL = "http://localhost:2222/notes";

function getCookie(name) {
    const cookies = document.cookie.split(';');
    const matchingCookies = cookies.filter(
        (v) => v.trim().split('=')[0] === name
    );
    if (matchingCookies.length === 0) {
        return null;
    }

    return matchingCookies[0].trim().split('=')[1];
}

function getUrlQueryParameter(name) {
    var queryString = window.location.search.substring(1);
    var queryArgs = queryString.split("&");
    var value = null;
    for (var i = 0; i < queryArgs.length; i++) {
        var pair = queryArgs[i].split("=");
        var key = decodeURIComponent(pair[0]);
        var v = decodeURIComponent(pair[1]);
        if (key === name) {
            value = v;
        }
    }

    return value;
}

function validateAuthToken() {
    const token = getCookie('access_token')
    if (!token) {
        window.location.href = "/auth/login?reason=unauthenticated"
    }
    return token
}

// API service interactions

function getNotes(token, callback) {
    genericSend('GET', API_URL, token, callback, JSON.parse);
}

function getNote(id, token, callback) {
    genericSend('GET', API_URL + '/' + id, token, callback, JSON.parse);
}

function getNoteContent(id, token, callback) {
    genericSend('GET', API_URL + '/' + id + '/content', token, callback);
}

function genericSend(method, url, token, callback, responseTransform) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            var response = xhr.response;
            if (responseTransform) {
                response = responseTransform(response);
            }
            console.log('Data received:', response);
            callback(response);
        } else {
            console.error('Request failed with status:', xhr.status);
        }
    };
    xhr.onerror = function() {
        console.error('Network error');
    };
    xhr.send();
}
