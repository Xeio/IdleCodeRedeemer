/// <reference path="./../lib/chrome.d.ts" />
/// <reference path="./../lib/redeem_code_response.d.ts" />
/// <reference path="./../shared/globals.ts" />

document.addEventListener("DOMContentLoaded", () => {
    loaded()
})

const _servicePort = chrome.runtime.connect({name:"options"})
_servicePort.onMessage.addListener(onMessage)
_servicePort.postMessage({messageType: MessageType.PageReady})

function onMessage(message: IdleMessage, port: chrome.runtime.Port){
    switch(message.messageType){
        case MessageType.Error:
        case MessageType.Info:
        case MessageType.Success:
        case MessageType.MissingCredentials:
            handleMessage(message)
            break
        case MessageType.ActivateTab:
            chrome.tabs.getCurrent((tab) => {
                if(tab?.id) {
                    chrome.tabs.update(tab.id, {"active":true})
                }
            })
            break
    }
}

function loaded(){
    chrome.storage.sync.get([Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], ({userId, userHash}) =>{
        const userIdElement = document.getElementById("userId") as HTMLInputElement
        userIdElement.value = userId ?? ""
        userIdElement.addEventListener("blur", settingsUpdated)

        const userHashElement = document.getElementById("userHash") as HTMLInputElement
        userHashElement.value = userHash ?? ""
        userHashElement.addEventListener("blur", settingsUpdated)
    })

    const userHashElement = document.getElementById("supportUrl") as HTMLInputElement
    userHashElement.addEventListener("blur", parseSupportUrl)
}

function settingsUpdated(this: HTMLElement, ev: FocusEvent){
    saveUpdatedSettings()
}

function saveUpdatedSettings(){
    chrome.storage.sync.set({
        [Globals.SETTING_USER_ID]: (document.getElementById("userId") as HTMLInputElement).value,
        [Globals.SETTING_USER_HASH]: (document.getElementById("userHash") as HTMLInputElement).value
    }, () => console.log("User settings saved"))
    document.getElementById("settingsInfo")!.classList.add("show")
    document.querySelector("#settingsInfo span")!.innerHTML = "After updating credentials, click browser extension button to launch new request."
}

function parseSupportUrl(this: HTMLElement, ev: FocusEvent){
    const userIdElement = document.getElementById("userId") as HTMLInputElement
    const userHashElement = document.getElementById("userHash") as HTMLInputElement
    const supportUrlElement = document.getElementById("supportUrl") as HTMLInputElement

    if(supportUrlElement.value == ""){
        return
    }

    try{
        const url = new URL(supportUrlElement.value)
        var userId = url.searchParams.get("user_id")
        var hash = url.searchParams.get("device_hash")
        
        if(!userId || !hash){
            document.getElementById("settingsInfo")!.classList.add("show")
            document.querySelector("#settingsInfo span")!.innerHTML = "Couldn't find user_id or device_hash parameters in URL."
            return
        }

        userIdElement.value = userId
        userHashElement.value = hash
        supportUrlElement.value = ""

        saveUpdatedSettings()
    }
    catch{
        document.getElementById("settingsInfo")!.classList.add("show")
        document.querySelector("#settingsInfo span")!.innerHTML = "Failed to parse URL. Make sure you are copying from the URL bar of the browser."
    }
}

function hideMessages() {
    document.getElementById("error")!.classList.remove("show")
    document.getElementById("success")!.classList.remove("show")
    document.getElementById("info")!.classList.remove("show")
    document.getElementById("errorSettings")!.classList.remove("show")
    document.querySelector("#chests tbody")!.innerHTML = ""
}

function handleMessage(message: IdleMessage){
    hideMessages()

    switch(message.messageType){
        case MessageType.Error:
            document.getElementById("error")!.classList.add("show")
            document.querySelector("#error span")!.innerHTML = message.messageText ?? ""
            break
        case MessageType.Info:
            document.getElementById("info")!.classList.add("show")
            document.querySelector("#info span")!.innerHTML = message.messageText ?? ""
            break
        case MessageType.MissingCredentials:
            document.getElementById("errorSettings")!.classList.add("show")
            document.querySelector("#errorSettings span")!.innerHTML = "Missing credentials."
            document.getElementById("settingsTabButton")!.click()
            break
        case MessageType.Success:
            document.getElementById("success")!.classList.add("show")
            document.querySelector("#success span")!.innerHTML = message.messageText ?? ""

            const chestsTableBody = document.querySelector("#chests tbody") as HTMLTableSectionElement
            chestsTableBody.innerHTML = ""
            let unknownCount = 0

            if(message.heroUnlocks){
                chestsTableBody.appendChild(buildTableRow("Hero Unlocks", message.heroUnlocks))
            }
            if(message.skinUnlocks){
                chestsTableBody.appendChild(buildTableRow("Skin Unlocks", message.skinUnlocks))
            }

            Object.entries(message.chests || []).forEach(([chestType, amount]) => {
                let label = ""
                switch(chestType){
                    case ChestType.Electrum.toString():
                        label = "Electrum Chests"
                        break
                    case ChestType.Gold.toString():
                        label = "Gold Chests"
                        break
                    case ChestType.Modron.toString():
                        label = "Modron Chests"
                        break
                    default:
                        unknownCount += amount
                        return
                }
                chestsTableBody.appendChild(buildTableRow(label, amount))
            })

            if(unknownCount > 0){
                chestsTableBody.appendChild(buildTableRow("Other Chests", unknownCount))
            }
            break
    }
}

function buildTableRow(label: string, amount: number) : HTMLTableRowElement{
    const labelColumn = document.createElement("td")
    labelColumn.innerText = label

    const amountColumn = document.createElement("td")
    amountColumn.innerText = amount.toString()

    const row = document.createElement("tr")
    row.classList.add("table-primary")
    row.appendChild(labelColumn)
    row.appendChild(amountColumn)

    return row
}