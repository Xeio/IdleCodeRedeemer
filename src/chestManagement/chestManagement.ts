/// <reference path="./../shared/globals.ts" />
/// <reference path="./../lib/chrome.d.ts" />
/// <reference path="./../lib/redeem_code_response.d.ts" />
/// <reference path="./../shared/idle_champions_api.ts" />

document.addEventListener("DOMContentLoaded", loaded)

const REQUEST_DELAY = 4000

let buyCountRange: HTMLInputElement, buyCountNumber: HTMLInputElement
let openCountRange: HTMLInputElement, openCountNumber: HTMLInputElement

let server: string | undefined
let instanceId: string | undefined
let userData: PlayerData | undefined
let shownCloseClientWarning = false

function loaded(){
    document.getElementById("refreshInventory")!.addEventListener('click', refreshClick)
    document.getElementById("purchaseButton")!.addEventListener('click', purchaseClick)
    document.getElementById("openButton")!.addEventListener('click', openClick)
    document.getElementById("buyChestType")?.addEventListener('change', setMaximumValues)
    document.getElementById("openChestType")?.addEventListener('change', setMaximumValues)

    buyCountRange = document.getElementById("buyCountRange") as HTMLInputElement
    buyCountNumber = document.getElementById("buyCountNumber") as HTMLInputElement
    buyCountRange.oninput = buyRangeChanged
    buyCountNumber.oninput = buyNumberChanged

    openCountRange = document.getElementById("openCountRange") as HTMLInputElement
    openCountNumber = document.getElementById("openCountNumber") as HTMLInputElement
    openCountRange.oninput = openRangeChanged
    openCountNumber.oninput = openNumberChanged
}

function buyRangeChanged(){
    buyCountNumber.value = buyCountRange.value
}

function buyNumberChanged(){
    if(parseInt(buyCountNumber.value) > parseInt(buyCountNumber.max)){
      buyCountNumber.value = buyCountNumber.max
    }
    buyCountRange.value = buyCountNumber.value
}

function openRangeChanged(){
    openCountNumber.value = openCountRange.value
}

function openNumberChanged(){
    if(parseInt(openCountNumber.value) > parseInt(openCountNumber.max)){
        openCountNumber.value = openCountNumber.max
    }
    openCountRange.value = openCountNumber.value
}

function refreshClick(){
    hideMessages()
    chrome.storage.sync.get(
        [Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], 
        ({userId, userHash}) => { 
            refreshInventory(userId, userHash)
        }
    )
}

async function refreshInventory(userId: string, hash: string) {
    if(!userId || userId.length == 0 || !hash || hash.length == 0){
        console.error("No credentials entered.")
        showError("No credentials entered.")
        return
    }
    
    if(!server){
        server = await IdleChampionsApi.getServer()
        console.log(`Got server ${server}`)
    }

    if(!server) {
        showError("Failed to get idle champions server.")
        console.error("Failed to get idle champions server.")
        return
    }

    userData = await IdleChampionsApi.getUserDetails({
        server: server,
        user_id: userId,
        hash: hash,
    })

    if(!userData) {
        showError("Failed to retreive user data.")
        console.error("Failed to retreive user data.")
        return
    }

    console.log("Refreshed inventory data.")
    console.debug(userData)

    instanceId = userData.details.instance_id
    chrome.storage.sync.set({[Globals.SETTING_INSTANCE_ID]: userData.details.instance_id})

    document.getElementById("gemCount")!.textContent = userData.details.red_rubies.toLocaleString()
    document.getElementById("silverChestCount")!.textContent = userData.details.chests[ChestType.Silver]?.toLocaleString() || ""
    document.getElementById("goldChestCount")!.textContent = userData.details.chests[ChestType.Gold]?.toLocaleString() || ""

    setMaximumValues()

    document.getElementById("actionTabs")!.classList.add("show")
}

function setMaximumValues(){
    if(!userData) return

    let gems = userData.details.red_rubies
    let silverChests = userData.details.chests[ChestType.Silver] || 0
    let goldChests = userData.details.chests[ChestType.Gold] || 0;

    let buyMax = 0
    switch((document.getElementById("buyChestType") as HTMLSelectElement).value){
        case ChestType.Silver.toString():
            buyMax = Math.trunc(gems / 50)
            break
        case ChestType.Gold.toString():
            buyMax = Math.trunc(gems / 500)
            break
    }

    (document.getElementById("buyCountRange") as HTMLInputElement).max = buyMax.toString();
    (document.getElementById("buyCountRange") as HTMLInputElement).value = buyMax.toString();
    (document.getElementById("buyCountNumber") as HTMLInputElement).max = buyMax.toString();
    (document.getElementById("buyCountNumber") as HTMLInputElement).value = buyMax.toString();

    let openMax = 0
    switch((document.getElementById("openChestType") as HTMLSelectElement).value){
        case ChestType.Silver.toString():
            openMax = silverChests
            break
        case ChestType.Gold.toString():
            openMax = goldChests
            break
    }

    (document.getElementById("openCountRange") as HTMLInputElement).max = openMax.toString();
    (document.getElementById("openCountRange") as HTMLInputElement).value = openMax.toString();
    (document.getElementById("openCountNumber") as HTMLInputElement).max = openMax.toString();
    (document.getElementById("openCountNumber") as HTMLInputElement).value = openMax.toString();
}

function purchaseClick(){
    hideMessages()
    chrome.storage.sync.get(
        [Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], 
        ({userId, userHash}) => { 
            purchaseChests(userId, userHash)
        }
    )
}

async function purchaseChests(userId: string, hash: string){
    if(!server) return

    const MAX_PURCHASE_AMOUNT = 100

    const chestType = <any>(document.getElementById("buyChestType") as HTMLSelectElement).value as ChestType
    const chestAmount = parseInt((document.getElementById("buyCountRange") as HTMLInputElement).value) || 0

    if(!chestType || chestAmount < 1){
        return
    }

    let remainingChests = chestAmount
    //Have to batch these into max of 100 at a time
    while(remainingChests > 0){
        showInfo(`Purchasing... ${remainingChests} chests remaining to purchase`)

        const currentAmount = remainingChests > MAX_PURCHASE_AMOUNT ? MAX_PURCHASE_AMOUNT : remainingChests
        remainingChests -= currentAmount

        console.log(`Purchasing ${currentAmount} chests`)

        const responseStatus = await IdleChampionsApi.purchaseChests({
            server: server,
            user_id: userId,
            hash: hash,
            chestTypeId: chestType,
            count: currentAmount
        })

        if(responseStatus == ResponseStatus.InsuficcientCurrency){
            console.error("Insufficient currency error")
            showError("Insufficient gems remaining")
            return
        }
        else if(responseStatus == ResponseStatus.Failed){
            console.error("Purchase API call failed")
            showError("Purchase failed")
            return
        }
        
        if(remainingChests > 0){
            await new Promise(h => setTimeout(h, REQUEST_DELAY)) //Delay between requests
        }
    }

    console.log("Completed purchase")

    refreshInventory(userId, hash)

    showSuccess(`Purchased ${chestAmount} chests`)
}

function openClick(){
    hideMessages()
    chrome.storage.sync.get(
        [Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], 
        ({userId, userHash}) => { 
            openChests(userId, userHash)
        }
    )
}

async function openChests(userId: string, hash: string){
    const MAX_OPEN_AMOUNT = 50

    if(!server || !instanceId) return

    if(!shownCloseClientWarning){
        showOpenWarning("You MUST close the client before calling open chests. Click open again to confirm.")
        shownCloseClientWarning = true
        return
    }
    shownCloseClientWarning = false

    const chestType = <any>(document.getElementById("openChestType") as HTMLSelectElement).value as ChestType
    const chestAmount = parseInt((document.getElementById("openCountRange") as HTMLInputElement).value) || 0

    if(!chestType || chestAmount < 1){
        return
    }

    let remainingChests = chestAmount
    //Have to batch these into max of 100 at a time
    while(remainingChests > 0){
        showInfo(`Opening... ${remainingChests} chests remaining to open`)
        
        const currentAmount = remainingChests > MAX_OPEN_AMOUNT ? MAX_OPEN_AMOUNT : remainingChests
        remainingChests -= currentAmount

        console.log(`Opening ${currentAmount} chests`)

        const responseStatus = await IdleChampionsApi.openChests({
            server: server,
            user_id: userId,
            hash: hash,
            chestTypeId: chestType,
            count: currentAmount,
            instanceId: instanceId,
        })

        if(responseStatus == ResponseStatus.OutdatedInstanceId){
            const lastInstanceId:string = instanceId
            console.log("Refreshing inventory for instance ID")

            refreshInventory(userId, hash)
            if(instanceId == lastInstanceId){
                console.error("Failed to refresh instance id")
                showError("Failed to get updated instance ID. Check credentials.")
                return
            }

            remainingChests += currentAmount
        }
        else if(responseStatus == ResponseStatus.Failed){
            console.error("Purchase API call failed")
            showError("Purchase failed")
            return
        }
        
        if(remainingChests > 0){
            await new Promise(h => setTimeout(h, REQUEST_DELAY)) //Delay between requests
        }
    }

    console.log("Completed opening")

    refreshInventory(userId, hash)

    showSuccess(`Opened ${chestAmount} chests`)
}


function hideMessages() {
    document.getElementById("error")!.classList.remove("show")
    document.getElementById("openWarning")!.classList.remove("show")
    document.getElementById("success")!.classList.remove("show")
    document.getElementById("info")!.classList.remove("show")
}

function showError(text:string){
    hideMessages()

    document.getElementById("error")!.classList.add("show")
    document.querySelector("#error span")!.innerHTML = text
}

function showOpenWarning(text:string){
    hideMessages()

    document.getElementById("openWarning")!.classList.add("show")
    document.querySelector("#openWarning span")!.innerHTML = text
}

function showInfo(text:string){
    hideMessages()

    document.getElementById("info")!.classList.add("show")
    document.querySelector("#info span")!.innerHTML = text
}

function showSuccess(text:string){
    hideMessages()

    document.getElementById("success")!.classList.add("show")
    document.querySelector("#success span")!.innerHTML = text
}


