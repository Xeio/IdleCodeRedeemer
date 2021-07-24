var Globals = (function () {
    function Globals() {
    }
    Globals.debugMode = !chrome.runtime.getManifest().update_url;
    Globals.discordChannelUrl = "https://discord.com/channels/357247482247380994/358044869685673985";
    Globals.SETTING_CODES = "redeemedCodes";
    Globals.SETTING_PENDING = "pendingCodes";
    Globals.SETTING_INSTANCE_ID = "instanceId";
    Globals.SETTING_USER_HASH = "userHash";
    Globals.SETTING_USER_ID = "userId";
    return Globals;
}());
document.addEventListener("DOMContentLoaded", function () {
    loaded();
});
chrome.runtime.onMessage.addListener(onMessage);
function onMessage(message, sender, sendResponse) {
    switch (message.messageType) {
        case "error":
        case "info":
        case "success":
        case "missingCredentials":
            handleMessage(message);
            break;
    }
}
function loaded() {
    document.getElementById("detectAndUpload").addEventListener('click', buttonClick);
    chrome.storage.sync.get([Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], function (_a) {
        var userId = _a.userId, userHash = _a.userHash;
        var userIdElement = document.getElementById("userId");
        userIdElement.value = userId !== null && userId !== void 0 ? userId : "";
        userIdElement.addEventListener("blur", settingsUpdated);
        var userHashElement = document.getElementById("userHash");
        userHashElement.value = userHash !== null && userHash !== void 0 ? userHash : "";
        userHashElement.addEventListener("blur", settingsUpdated);
    });
}
function settingsUpdated(ev) {
    var _a;
    chrome.storage.sync.set((_a = {},
        _a[Globals.SETTING_USER_ID] = document.getElementById("userId").value,
        _a[Globals.SETTING_USER_HASH] = document.getElementById("userHash").value,
        _a), function () { return console.log("User settings saved"); });
}
function buttonClick() {
    hideMessages();
    chrome.tabs.create({ url: Globals.discordChannelUrl });
}
function hideMessages() {
    document.getElementById("error").classList.remove("show");
    document.getElementById("success").classList.remove("show");
    document.getElementById("info").classList.remove("show");
    document.getElementById("errorSettings").classList.remove("show");
}
function handleMessage(message) {
    hideMessages();
    switch (message.messageType) {
        case "error":
            document.getElementById("error").classList.add("show");
            document.querySelector("#error span").innerHTML = message.messageText;
            break;
        case "info":
            document.getElementById("info").classList.add("show");
            document.querySelector("#info span").innerHTML = message.messageText;
            break;
        case "success":
            document.getElementById("success").classList.add("show");
            document.querySelector("#success span").innerHTML = message.messageText;
            break;
        case "missingCredentials":
            document.getElementById("errorSettings").classList.add("show");
            document.querySelector("#errorSettings span").innerHTML = "Missing credentials on settings tab.";
            document.getElementById("settingsTabButton").click();
            break;
    }
}
