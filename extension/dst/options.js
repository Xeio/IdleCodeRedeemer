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
function loaded() {
    document.getElementById("Run").addEventListener('click', buttonClick);
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
    chrome.tabs.create({ url: Globals.discordChannelUrl });
}
