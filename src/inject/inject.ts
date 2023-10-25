/// <reference path="./../lib/chrome.d.ts" />
/// <reference path="./../shared/globals.ts" />

const _servicePort = chrome.runtime.connect({name:"page"})
_servicePort.onMessage.addListener(onMessage)
_servicePort.postMessage({messageType: MessageType.PageReady})

const _observer = new MutationObserver((mutationList, observer) => {
    if(mutationList.some((mut) => mut.addedNodes.length > 0))
    {
        const codes = getCodesList()
        if(codes.length > 0){
            console.info("Observer found codes, sending to service worker")

            observer.disconnect()
            _servicePort.postMessage({messageType: MessageType.Codes, codes: codes})
        }
    }
})

function onMessage(message: IdleMessage, port: chrome.runtime.Port){
    switch(message.messageType){
        case MessageType.ScanCodes:
            console.info("Scan codes message received.")

            const codes = getCodesList()
            if(codes.length > 0){
                console.info("Found codes, sending to service worker")
                port.postMessage({messageType: MessageType.Codes, codes: codes})
            }
            else{
                //Got message too early, need to wait for page to finish loading
                console.info("Codes not found yet, observing DOM for new codes.")

                const observerConfig = { childList: true, subtree: true }
                _observer.observe(window.document, observerConfig)
            }

            break
        case MessageType.CloseTab:
            window.close()
            break
    }
}

function getCodesList() : string[] {
    const regex = /(?:[A-Z0-9*!@#$%^&*]-?){12}(?:(?:[A-Z0-9*!@#$%^&*]-?){4})?/g
    const codes: string[] = []

    const messageElements = document.querySelectorAll("div[class^='message']")
    messageElements.forEach(messageElement => {
        const markupElement = messageElement.querySelector("div[class^='markup']") as HTMLElement
        if(markupElement){
            const codeMatch = markupElement.innerText.toUpperCase().match(regex)
            if(codeMatch?.[0]){
                const code = codeMatch[0].replaceAll("-", "")
                console.debug(`Idle Code found: ${code}`)
                codes.push(code)
            }
        }
    })

    return codes
}
