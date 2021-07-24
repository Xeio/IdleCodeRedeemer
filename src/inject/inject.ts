/// <reference path="./../lib/chrome.d.ts" />

const observer = new MutationObserver((mutationList, observer) => {
    if(mutationList.some((mut) => mut.addedNodes.length > 0))
    {
        let regex = /[A-Z0-9*!@#$%^&*]{4}-?[A-Z0-9*!@#$%^&*]{4}-?[A-Z0-9*!@#$%^&*]{4}-?([A-Z0-9*!@#$%^&*]{4})?/g;
        let codes = [];

        let messageElements = document.querySelectorAll("div[class^='message-']");
        messageElements.forEach(messageElement => {
            let markupElement: HTMLElement = messageElement.querySelector("div[class^='markup-']")
            if(markupElement){
                let codeMatch = markupElement.innerText.toUpperCase().match(regex)
                if(codeMatch){
                    let code = codeMatch[0].replaceAll("-", "");
                    console.debug("Idle Code found: " + code);
                    codes.push(code);
                }
            }
        });

        if(codes.length > 0){
            console.debug("Sending idle codes to service worker");
            chrome.runtime.sendMessage({messageType: "codes", codes: codes});
            //window.close();
            //observer.disconnect();
        }
    }
});

const observerConfig = { childList: true, subtree: true };

observer.observe(window.document, observerConfig);