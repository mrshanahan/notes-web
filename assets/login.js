// depends on notes.js

function setLoginBanner() {
    var reason = getUrlQueryParameter('reason');
    if (reason === "unauthenticated") {
        const container = document.getElementById("login-container");
        const loginLink = document.getElementById("login-link");
        const bannerNode = document.createElement("div");
        bannerNode.className = "banner";
        bannerNode.innerText = "Authentication failed. Please login again.";
        container.insertBefore(bannerNode, loginLink);
    }
}