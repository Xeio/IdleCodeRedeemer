/// <reference path="./../lib/chrome.d.ts" />
/// <reference path="./../shared/globals.ts" />

let _port = chrome.runtime.connect()
_port.onMessage.addListener(onMessage)

const observer = new MutationObserver((mutationList, observer) => {
    if(mutationList.some((mut) => mut.addedNodes.length > 0))
    {
        let codes = getCodesList()
        if(codes.length > 0){
            console.info("Observer found codes, sending to service worker")

            observer.disconnect()
            _port.postMessage({messageType: "codes", codes: codes})
        }
    }
})

function onMessage(message: IdleMessage, port: chrome.runtime.Port){
    switch(message.messageType){
        case MessageType.ScanCodes:
            console.info("Scan codes message received.")

            let codes = getCodesList()
            if(codes.length > 0){
                console.info("Found codes, sending to service worker")
                port.postMessage({messageType: "codes", codes: codes})
            }
            else{
                //Got message too early, need to wait for page to finish loading
                console.info("Codes not found yet, observing DOM for new codes.")

                const observerConfig = { childList: true, subtree: true }
                observer.observe(window.document, observerConfig)
            }

            break
        case MessageType.CloseTab:
            window.close()
            break
    }
}

function getCodesList() : string[] {
    let regex = /[A-Z0-9*!@#$%^&*]{4}-?[A-Z0-9*!@#$%^&*]{4}-?[A-Z0-9*!@#$%^&*]{4}-?([A-Z0-9*!@#$%^&*]{4})?/g
    let codes: string[] = []

    let messageElements = document.querySelectorAll("div[class^='message-']")
    messageElements.forEach(messageElement => {
        let markupElement: HTMLElement = messageElement.querySelector("div[class^='markup-']")
        if(markupElement){
            let codeMatch = markupElement.innerText.toUpperCase().match(regex)
            if(codeMatch){
                let code = codeMatch[0].replaceAll("-", "")
                console.debug(`Idle Code found: ${code}`)
                codes.push(code)
            }
        }
    })

    return codes
}
