/// <reference path="./../lib/chrome.d.ts" />
var Globals = /** @class */ (function () {
    function Globals() {
    }
    Globals.debugMode = !chrome.runtime.getManifest().update_url;
    Globals.discordChannelUrl = "https://discord.com/channels/357247482247380994/358044869685673985";
    return Globals;
}());
/// <reference path="./../lib/chrome.d.ts" />
/// <reference path="./../shared/globals.ts" />
document.addEventListener("DOMContentLoaded", function (event) {
    //preferences.load().then(loaded);
    loaded();
});
function loaded() {
    // preferences.getAllPrefs().forEach(pref => {
    //     let element = document.getElementById(pref.name);
    //     if(element.type === "checkbox"){
    //         element.checked = preferences.getPrefValue(pref);
    //     }
    //     else{
    //         element.value = preferences.getPrefValue(pref);
    //     }
    //     element.onchange = onChange;
    // });
    document.getElementById("Run").addEventListener('click', buttonClick);
}
function buttonClick() {
    chrome.tabs.create({ url: Globals.discordChannelUrl });
}
