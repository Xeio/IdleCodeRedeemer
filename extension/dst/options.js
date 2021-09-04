"use strict";
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
var _servicePort = chrome.runtime.connect({ name: "options" });
_servicePort.onMessage.addListener(onMessage);
_servicePort.postMessage({ messageType: "pageReady" });
function onMessage(message, port) {
    switch (message.messageType) {
        case "error":
        case "info":
        case "success":
        case "missingCredentials":
            handleMessage(message);
            break;
        case "activateTab":
            chrome.tabs.getCurrent(function (tab) {
                if (tab === null || tab === void 0 ? void 0 : tab.id) {
                    chrome.tabs.update(tab.id, { "active": true });
                }
            });
            break;
    }
}
function loaded() {
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
    document.getElementById("settingsInfo").classList.add("show");
    document.querySelector("#settingsInfo span").innerHTML = "After updating credentials, click browser extension button to launch new request.";
}
function hideMessages() {
    document.getElementById("error").classList.remove("show");
    document.getElementById("success").classList.remove("show");
    document.getElementById("info").classList.remove("show");
    document.getElementById("errorSettings").classList.remove("show");
    document.querySelector("#chests tbody").innerHTML = "";
}
function handleMessage(message) {
    var _a, _b, _c;
    hideMessages();
    switch (message.messageType) {
        case "error":
            document.getElementById("error").classList.add("show");
            document.querySelector("#error span").innerHTML = (_a = message.messageText) !== null && _a !== void 0 ? _a : "";
            break;
        case "info":
            document.getElementById("info").classList.add("show");
            document.querySelector("#info span").innerHTML = (_b = message.messageText) !== null && _b !== void 0 ? _b : "";
            break;
        case "missingCredentials":
            document.getElementById("errorSettings").classList.add("show");
            document.querySelector("#errorSettings span").innerHTML = "Missing credentials.";
            document.getElementById("settingsTabButton").click();
            break;
        case "success":
            document.getElementById("success").classList.add("show");
            document.querySelector("#success span").innerHTML = (_c = message.messageText) !== null && _c !== void 0 ? _c : "";
            var chestsTableBody_1 = document.querySelector("#chests tbody");
            chestsTableBody_1.innerHTML = "";
            var unknownCount_1 = 0;
            if (message.heroUnlocks) {
                chestsTableBody_1.appendChild(buildTableRow("Hero Unlocks", message.heroUnlocks));
            }
            Object.entries(message.chests || []).forEach(function (_a) {
                var chestType = _a[0], amount = _a[1];
                var label = "";
                switch (chestType) {
                    case 282..toString():
                        label = "Electrum Chests";
                        break;
                    case 2..toString():
                        label = "Gold Chests";
                        break;
                    case 230..toString():
                        label = "Modron Chests";
                        break;
                    default:
                        unknownCount_1 += amount;
                        return;
                }
                chestsTableBody_1.appendChild(buildTableRow(label, amount));
            });
            if (unknownCount_1 > 0) {
                chestsTableBody_1.appendChild(buildTableRow("Other Chests", unknownCount_1));
            }
            break;
    }
}
function buildTableRow(label, amount) {
    var labelColumn = document.createElement("td");
    labelColumn.innerText = label;
    var amountColumn = document.createElement("td");
    amountColumn.innerText = amount.toString();
    var row = document.createElement("tr");
    row.classList.add("table-primary");
    row.appendChild(labelColumn);
    row.appendChild(amountColumn);
    return row;
}
