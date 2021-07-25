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
var _port = chrome.runtime.connect();
_port.onMessage.addListener(onMessage);
_port.postMessage({ messageType: "pageReady" });
var _observer = new MutationObserver(function (mutationList, observer) {
    if (mutationList.some(function (mut) { return mut.addedNodes.length > 0; })) {
        var codes = getCodesList();
        if (codes.length > 0) {
            console.info("Observer found codes, sending to service worker");
            observer.disconnect();
            _port.postMessage({ messageType: "codes", codes: codes });
        }
    }
});
function onMessage(message, port) {
    switch (message.messageType) {
        case "scanCodes":
            console.info("Scan codes message received.");
            var codes = getCodesList();
            if (codes.length > 0) {
                console.info("Found codes, sending to service worker");
                port.postMessage({ messageType: "codes", codes: codes });
            }
            else {
                console.info("Codes not found yet, observing DOM for new codes.");
                var observerConfig = { childList: true, subtree: true };
                _observer.observe(window.document, observerConfig);
            }
            break;
        case "closeTab":
            window.close();
            break;
    }
}
function getCodesList() {
    var regex = /[A-Z0-9*!@#$%^&*]{4}-?[A-Z0-9*!@#$%^&*]{4}-?[A-Z0-9*!@#$%^&*]{4}-?([A-Z0-9*!@#$%^&*]{4})?/g;
    var codes = [];
    var messageElements = document.querySelectorAll("div[class^='message-']");
    messageElements.forEach(function (messageElement) {
        var markupElement = messageElement.querySelector("div[class^='markup-']");
        if (markupElement) {
            var codeMatch = markupElement.innerText.toUpperCase().match(regex);
            if (codeMatch) {
                var code = codeMatch[0].replaceAll("-", "");
                console.debug("Idle Code found: " + code);
                codes.push(code);
            }
        }
    });
    return codes;
}
