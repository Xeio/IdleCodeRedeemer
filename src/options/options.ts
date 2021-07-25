/// <reference path="./../lib/chrome.d.ts" />
/// <reference path="./../lib/redeem_code_response.d.ts" />
/// <reference path="./../shared/globals.ts" />

document.addEventListener("DOMContentLoaded", () => {
    loaded()
})

chrome.runtime.onMessage.addListener(onMessage)

function onMessage(message: IdleMessage, sender: any, sendResponse: any){
    switch(message.messageType){
        case MessageType.Error:
        case MessageType.Info:
        case MessageType.Success:
        case MessageType.MissingCredentials:
            handleMessage(message)
            break
    }
}

function loaded(){
    document.getElementById("detectAndUpload").addEventListener('click', buttonClick)

    chrome.storage.sync.get([Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], ({userId, userHash}) =>{
        let userIdElement = document.getElementById("userId") as HTMLInputElement
        userIdElement.value = userId ?? ""
        userIdElement.addEventListener("blur", settingsUpdated)

        let userHashElement = document.getElementById("userHash") as HTMLInputElement
        userHashElement.value = userHash ?? ""
        userHashElement.addEventListener("blur", settingsUpdated)
    })
}

function settingsUpdated(this: HTMLElement, ev: FocusEvent){
    chrome.storage.sync.set({
        [Globals.SETTING_USER_ID]: (document.getElementById("userId") as HTMLInputElement).value,
        [Globals.SETTING_USER_HASH]: (document.getElementById("userHash") as HTMLInputElement).value
    }, () => console.log("User settings saved"))
}

function buttonClick(){
    hideMessages()

    chrome.runtime.sendMessage({messageType: MessageType.StartScanProcess})
}

function hideMessages() {
    document.getElementById("error").classList.remove("show")
    document.getElementById("success").classList.remove("show")
    document.getElementById("info").classList.remove("show")
    document.getElementById("errorSettings").classList.remove("show")
    document.querySelector("#chests tbody").innerHTML = ""
}

function handleMessage(message: IdleMessage){
    hideMessages()

    switch(message.messageType){
        case MessageType.Error:
            document.getElementById("error").classList.add("show")
            document.querySelector("#error span").innerHTML = message.messageText
            break
        case MessageType.Info:
            document.getElementById("info").classList.add("show")
            document.querySelector("#info span").innerHTML = message.messageText
            break
        case MessageType.MissingCredentials:
            document.getElementById("errorSettings").classList.add("show")
            document.querySelector("#errorSettings span").innerHTML = "Missing credentials on settings tab."
            document.getElementById("settingsTabButton").click()
            break
        case MessageType.Success:
            document.getElementById("success").classList.add("show")
            document.querySelector("#success span").innerHTML = message.messageText

            let chestsTableBody = document.querySelector("#chests tbody") as HTMLTableSectionElement
            chestsTableBody.innerHTML = ""
            let unknownCount = 0

            Object.entries(message.chests).forEach(([chestType, amount]) => {
                let label = ""
                switch(chestType){
                    case ChestType.Electrum.toString():
                        label = "Electrum Chests"
                        break
                    case ChestType.Gold.toString():
                        label = "Gold Chests"
                        break
                    default:
                        unknownCount += amount
                        return
                }
                chestsTableBody.appendChild(buildTableRow(label, amount))
            })

            if(unknownCount > 0){
                chestsTableBody.appendChild(buildTableRow("Unknown/Other Chests", unknownCount))
            }
            break
    }
}

function buildTableRow(label: string, amount: number) : HTMLTableRowElement{
    let labelColumn = document.createElement("td")
    labelColumn.innerText = label

    let amountColumn = document.createElement("td")
    amountColumn.innerText = amount.toString()

    let row = document.createElement("tr")
    row.classList.add("table-primary")
    row.appendChild(labelColumn)
    row.appendChild(amountColumn)

    return row
}