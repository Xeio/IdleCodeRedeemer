/// <reference path="./../lib/chrome.d.ts" />
/// <reference path="./../lib/player_data.d.ts" />
/// <reference path="./../lib/redeem_code_response.d.ts" />
/// <reference path="./../lib/server_definitions.d.ts" />
/// <reference path="./../shared/globals.ts" />
/// <reference path="./../shared/idle_champions_api.ts" />

const REQUEST_DELAY = 2000

let _waitingForPagePort = false
let _optionsPort: chrome.runtime.Port

chrome.runtime.onConnect.addListener((port) => {
    if(port.name == "page"){
        if(_waitingForPagePort){
            console.log("New port opened.")
            _waitingForPagePort = false
            port.onMessage.addListener(onPagePortMessage)
        }
        else{
            console.log("Unexpected port, disconnecting.")
            //We weren't expecting this port, so just disconnect it immediately
            port.disconnect()
        }
    }
    else if (port.name == "options"){
        _optionsPort?.disconnect()
        port.onMessage.addListener(onOptionsPortMessage)
        _optionsPort = port
    }
})

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        contexts: ["action"],
        title: "Open chest management",
        id: "ChestManagement"
    })
});

chrome.contextMenus.onClicked.addListener(onOpenExtensionPageClick)

function onOpenExtensionPageClick(info?: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab){
    if(info?.menuItemId == "ChestManagement"){
        chrome.tabs.create({url: "dst/chestManagement.html"})
    }
}

function onPagePortMessage(message: IdleMessage, port: chrome.runtime.Port){
    switch(message.messageType){
        case MessageType.PageReady:
            console.log("Page ready message")
            port.postMessage({messageType: MessageType.ScanCodes})
            break
        case MessageType.Codes:
            console.log("Code message received")

            chrome.storage.sync.get([Globals.SETTING_CODES, Globals.SETTING_PENDING], 
                ({redeemedCodes, pendingCodes}) => { handleDetectedCodes(redeemedCodes, pendingCodes, message.codes) }
            )

            port.postMessage({messageType: MessageType.CloseTab})
            port.disconnect()
            break
    }
}

function onOptionsPortMessage(message: IdleMessage, port: chrome.runtime.Port){
    if(message.messageType == MessageType.PageReady){
        port.postMessage({messageType: MessageType.Info, messageText:`Opening discord tab to scan for codes.` })
        console.log("Starting scan/upolad process. Opening discord tab.")

        _waitingForPagePort = true
        chrome.tabs.create({ url: Globals.discordChannelUrl })
        
        port.postMessage({messageType: MessageType.ActivateTab})
    }
}

chrome.action.onClicked.addListener(browserActionClicked)
function browserActionClicked(tab:chrome.tabs.Tab) {
    chrome.tabs.create({url: "dst/options.html"})
}

function handleDetectedCodes(redeemedCodes: string[], pendingCodes: string[], detectedCodes?: string[]){
    if(!detectedCodes || detectedCodes.length == 0) return

    if(!redeemedCodes) redeemedCodes = [] //Default if first run
    if(!pendingCodes) pendingCodes = [] //Default if first run

    let detectedCode:string | undefined
    while(detectedCode = detectedCodes.pop()){
        if(!redeemedCodes.includes(detectedCode) && !pendingCodes.includes(detectedCode)){
            //New code
            console.log(`New code detected: ${detectedCode}`)

            pendingCodes.push(detectedCode)
        }
        else if(pendingCodes.includes(detectedCode)){
            console.debug(`Duplicate pending code: ${detectedCode}`)
        }
        else{
            console.debug(`Duplicate redeemed code: ${detectedCode}`)
        }
    }

    if(pendingCodes.length > 0){
        console.log("New codes detected, saving list.")
        console.debug(pendingCodes)
        
        chrome.storage.sync.set({[Globals.SETTING_CODES]: redeemedCodes, [Globals.SETTING_PENDING]: pendingCodes}, () => {
            startUploadProcess()
        })
    }
    else{
        console.log("No new codes detected.")
        _optionsPort.postMessage({messageType: MessageType.Info, messageText:`No new codes detected.` })
    }
}
function startUploadProcess(){
    chrome.storage.sync.get(
        [Globals.SETTING_CODES, Globals.SETTING_PENDING, Globals.SETTING_INSTANCE_ID, Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], 
        ({redeemedCodes, pendingCodes, instanceId, userId, userHash}) => { 
            console.log("Beginning upload.")
            uploadCodes(redeemedCodes, pendingCodes, instanceId, userId, userHash)
        }
    )
}

async function uploadCodes(reedemedCodes: string[], pendingCodes: string[], instanceId: string, userId: string, hash: string) {
    if(!userId || userId.length == 0 || !hash || hash.length == 0){
        _optionsPort.postMessage({messageType: MessageType.MissingCredentials})
        console.error("No credentials entered.")
        return
    }
    
    let server = await IdleChampionsApi.getServer()

    if(!server) { 
        console.error("Failed to get idle champions server.")
        _optionsPort.postMessage({messageType: MessageType.Error, messageText:"Unable to connect to Idle Champions server."})
        return
    }

    console.log(`Got server ${server}`)

    _optionsPort.postMessage({messageType: MessageType.Info, messageText:`Upload starting, ${pendingCodes.length} new codes to redeem. This may take a bit.` })

    let duplicates = 0, newCodes = 0, expired = 0, invalid = 0, cannotRedeem = 0
    const chests: {[chestType: number]: number} = {}
    let heroUnlocks = 0, skinUnlocks = 0

    let code:string | undefined
    while(code = pendingCodes.pop()){
        await new Promise(h => setTimeout(h, REQUEST_DELAY)) //Delay between requests

        console.log(`Attempting to upload code: ${code}`)

        let codeResponse: GenericResponse | CodeSubmitResponse = await IdleChampionsApi.submitCode({
            server: server,
            user_id: userId, 
            hash: hash,
            instanceId: instanceId,
            code: code 
        })

        if("status" in codeResponse && codeResponse.status == ResponseStatus.SwitchServer && codeResponse.newServer){
            console.log("Switching server")

            server = codeResponse.newServer

            codeResponse = await IdleChampionsApi.submitCode({
                server: server,
                user_id: userId, 
                hash: hash,
                instanceId: instanceId,
                code: code 
            })
        }
        if("status" in codeResponse && codeResponse.status == ResponseStatus.OutdatedInstanceId){
            console.log("Instance ID outdated, refreshing.")

            await new Promise(h => setTimeout(h, REQUEST_DELAY)) //Delay between requests
            
            const userData = await IdleChampionsApi.getUserDetails({
                server: server,
                user_id: userId,
                hash: hash,
            })

            if(IdleChampionsApi.isGenericResponse(userData)) {
                console.log("Failed to retreive user data.")
                _optionsPort.postMessage({messageType: MessageType.Error, messageText:"Failed to retreieve user data, check user ID and hash."})
                return
            }
            else{
                instanceId = userData.details.instance_id
            }
            chrome.storage.sync.set({[Globals.SETTING_INSTANCE_ID]: instanceId})

            await new Promise(h => setTimeout(h, REQUEST_DELAY)) //Delay between requests

            codeResponse = await IdleChampionsApi.submitCode({
                server: server,
                user_id: userId, 
                hash: hash,
                instanceId: instanceId,
                code: code 
            })
        }

        if("status" in codeResponse){
            //Failed for a second time in a row for some reason (or for some un-handled failure type), just abort
            console.error("Unable to submit code, aborting upload process.")
            _optionsPort.postMessage({messageType: MessageType.Error, messageText:"Failed to submit code for unknown reason."})
            return
        }
        else if("codeStatus" in codeResponse){
            switch(codeResponse.codeStatus){
                case CodeSubmitStatus.InvalidParameters:
                    console.error("Unable to submit code due to invalid parameters.")
                    _optionsPort.postMessage({messageType: MessageType.Error, messageText:"Failed to submit code, check user/hash on settings tab."})
                    return
                case CodeSubmitStatus.Expired:
                case CodeSubmitStatus.NotValidCombo:
                case CodeSubmitStatus.AlreadyRedeemed:
                case CodeSubmitStatus.Success:
                case CodeSubmitStatus.CannotRedeem:
                    if(codeResponse.codeStatus == CodeSubmitStatus.AlreadyRedeemed) {
                        console.log(`Already redeemed code: ${code}`)
                        duplicates++
                    }
                    else if(codeResponse.codeStatus == CodeSubmitStatus.NotValidCombo) {
                        console.log(`Invalid code: ${code}`)
                        invalid++
                    }
                    else if(codeResponse.codeStatus == CodeSubmitStatus.Expired) {
                        console.log(`Expired code: ${code}`)
                        expired++
                    }
                    if(codeResponse.codeStatus == CodeSubmitStatus.CannotRedeem) {
                        console.log(`Cannot redeem: ${code}`)
                        cannotRedeem++
                    }
                    else{
                        console.log(`Sucessfully redeemed: ${code}`)
                        codeResponse.lootDetail?.forEach(loot => {
                            switch(loot.loot_action){
                                case LootType.Chest:
                                    if(loot.chest_type_id && loot.count){
                                        chests[loot.chest_type_id] = (chests[loot.chest_type_id] ?? 0) + loot.count
                                    }
                                    break
                                case LootType.HeroUnlock:
                                    heroUnlocks++
                                    break
                                case LootType.Claim:
                                    if(loot.unlock_hero_skin){
                                        skinUnlocks++
                                    }
                                    break
                            }
                        })
                        newCodes++
                    }

                    reedemedCodes.push(code)
                    if(reedemedCodes.length > 300){
                        //Trim codes so our storage doesn't eventually exceed browser quotas
                        reedemedCodes.shift()
                    }
                    chrome.storage.sync.set({[Globals.SETTING_CODES]: reedemedCodes, [Globals.SETTING_PENDING]: pendingCodes})
                    
                    break
            }
        }

        _optionsPort.postMessage({messageType: MessageType.Info, messageText:`Uploading... ${pendingCodes.length} codes left. This may take a bit.` })
    }

    console.log("Redeem complete:")
    console.log(`${duplicates} duplicate codes`)
    console.log(`${newCodes} new redemptions`)
    console.log(`${expired} expired`)
    console.log(`${invalid} invalid`)
    console.log(`${cannotRedeem} unable to be redeemed`)
    console.log(chests)
    _optionsPort.postMessage({
        messageType: MessageType.Success,
        chests: chests,
        heroUnlocks: heroUnlocks,
        skinUnlocks: skinUnlocks,
        messageText: `Upload completed successfully:<br>
                        ${duplicates > 0 ? `${duplicates} codes already redeemed<br>` : ""}
                        ${expired > 0 ? `${expired} expired codes<br>` : ""}
                        ${invalid > 0 ? `${invalid} invalid codes<br>` : ""}
                        ${cannotRedeem > 0 ? `${cannotRedeem} unable to be redeemed<br>` : ""}
                        ${newCodes} codes redeemed`
    })
}