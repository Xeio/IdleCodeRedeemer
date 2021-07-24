var lastCodes = [];
var observer = new MutationObserver(function (mutationList, observer) {
    if (mutationList.some(function (mut) { return mut.addedNodes.length > 0; })) {
        var regex_1 = /[A-Z0-9*!@#$%^&*]{4}-?[A-Z0-9*!@#$%^&*]{4}-?[A-Z0-9*!@#$%^&*]{4}-?([A-Z0-9*!@#$%^&*]{4})?/g;
        var codes_1 = [];
        var messageElements = document.querySelectorAll("div[class^='message-']");
        messageElements.forEach(function (messageElement) {
            var markupElement = messageElement.querySelector("div[class^='markup-']");
            if (markupElement) {
                var codeMatch = markupElement.innerText.toUpperCase().match(regex_1);
                if (codeMatch) {
                    var code = codeMatch[0].replaceAll("-", "");
                    console.debug("Idle Code found: " + code);
                    codes_1.push(code);
                }
            }
        });
        if (codes_1.length > 0) {
            lastCodes = codes_1;
            console.info("Sending idle codes to service worker");
            chrome.runtime.sendMessage({ messageType: "codes", codes: codes_1 });
        }
    }
});
var observerConfig = { childList: true, subtree: true };
observer.observe(window.document, observerConfig);
