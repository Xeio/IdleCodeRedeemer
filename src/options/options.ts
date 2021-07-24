/// <reference path="./../lib/chrome.d.ts" />
/// <reference path="./../shared/globals.ts" />

document.addEventListener("DOMContentLoaded", () => {
    loaded()
})

function loaded(){
    document.getElementById("Run").addEventListener('click', buttonClick)

    chrome.storage.sync.get([Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], ({userId, userHash}) =>{
        let userIdElement = document.getElementById("userId") as HTMLInputElement
        userIdElement.value = userId ?? "";
        userIdElement.addEventListener("blur", settingsUpdated)

        let userHashElement = document.getElementById("userHash") as HTMLInputElement
        userHashElement.value = userHash ?? "";
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
    chrome.tabs.create({ url: Globals.discordChannelUrl })
}