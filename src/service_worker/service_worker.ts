/// <reference path="./../lib/chrome.d.ts" />
/// <reference path="./../lib/player_data.d.ts" />
/// <reference path="./../lib/redeem_code_response.d.ts" />
/// <reference path="./../lib/server_definitions.d.ts" />
/// <reference path="./../shared/globals.ts" />
/// <reference path="./idle_champions_api.ts" />

chrome.action.setIcon({"path" : "media/icon-enabled.png"}, () => {})

let _waitingForPort = false

chrome.runtime.onConnect.addListener((port) => {
    if(_waitingForPort){
        console.log("New port opened.")
        _waitingForPort = false
        port.onMessage.addListener(onPortMessage)
    }
    else{
        console.log("Unexpected port, disconnecting.")
        //We weren't expecting this port, so just disconnect it immediately
        port.disconnect()
    }
})

function onPortMessage(message: IdleMessage, port: chrome.runtime.Port){
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

chrome.runtime.onMessage.addListener(onRuntimeMessage)

function onRuntimeMessage(message: IdleMessage, sender: any, sendResponse: any){
    if(message.messageType == MessageType.StartScanProcess){
        console.log("Starting scan/upolad process. Opening discord tab.")

        _waitingForPort = true
        chrome.tabs.create({ url: Globals.discordChannelUrl })
    }
}

chrome.action.onClicked.addListener(browserActionClicked)
function browserActionClicked(tab:chrome.tabs.Tab) {
    chrome.tabs.create({url: "dst/options.html"})
}

function handleDetectedCodes(redeemedCodes: string[], pendingCodes: string[], detectedCodes: string[]){
    if(!detectedCodes || detectedCodes.length == 0) return

    if(!redeemedCodes) redeemedCodes = [] //Default if first run
    if(!pendingCodes) pendingCodes = [] //Default if first run

    while(detectedCodes.length > 0){
        let detectedCode = detectedCodes.pop()

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
        chrome.runtime.sendMessage({messageType: MessageType.Info, messageText:`No new codes detected.` })
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
        chrome.runtime.sendMessage({messageType: MessageType.MissingCredentials})
        console.error("No credentials entered.")
        return
    }
    
    let server = await IdleChampionsApi.getServer()

    if(!server) { 
        console.error("Failed to get idle champions server.")
        chrome.runtime.sendMessage({messageType: MessageType.Error, messageText:"Unable to connect to Idle Champions server."})
        return
    }

    console.log(`Got server ${server}`)

    chrome.runtime.sendMessage({messageType: MessageType.Info, messageText:`Upload starting, ${pendingCodes.length} new codes to redeem. This may take a bit.` })

    let duplicates = 0, newCodes = 0, expired = 0, invalid = 0
    let chests: {[chestType: number]: number} = {}

    while(pendingCodes.length > 0){
        await new Promise(h => setTimeout(h, 5000)) //Delay between requests
        
        let code = pendingCodes.pop()

        console.log(`Attempting to upload code: ${code}`)

        let codeResponse = await IdleChampionsApi.submitCode({
            server: server,
            user_id: userId, 
            hash: hash,
            instanceId: instanceId,
            code: code 
        })

        if(codeResponse.status == CodeSubmitStatus.OutdatedInstanceId){
            console.log("Instance ID outdated, refreshing.")

            await new Promise(h => setTimeout(h, 3000)) //Delay between requests
            
            let userData = await IdleChampionsApi.getUserDetails({
                server: server,
                user_id: userId,
                hash: hash,
            })

            if(!userData) {
                console.log("Failed to retreive user data.")
                chrome.runtime.sendMessage({messageType: MessageType.Error, messageText:"Failed to retreieve user data, check user ID and hash."})
                return
            }

            instanceId = userData.details.instance_id
            chrome.storage.sync.set({[Globals.SETTING_INSTANCE_ID]: instanceId})

            await new Promise(h => setTimeout(h, 3000)) //Delay between requests

            codeResponse = await IdleChampionsApi.submitCode({
                server: server,
                user_id: userId, 
                hash: hash,
                instanceId: instanceId,
                code: code 
            })
        }

        switch(codeResponse.status){
            case CodeSubmitStatus.OutdatedInstanceId:
            case CodeSubmitStatus.Failed:
                console.error("Unable to submit code, aborting upload process.")
                chrome.runtime.sendMessage({messageType: MessageType.Error, messageText:"Failed to submit code for unknown reason."})
                return
            case CodeSubmitStatus.InvalidParameters:
                console.error("Unable to submit code due to invalid parameters.")
                chrome.runtime.sendMessage({messageType: MessageType.Error, messageText:"Failed to submit code, check user/hash on settings tab."})
                return
            case CodeSubmitStatus.Expired:
            case CodeSubmitStatus.NotValidCombo:
            case CodeSubmitStatus.AlreadyRedeemed:
            case CodeSubmitStatus.Success:
                if(codeResponse.status == CodeSubmitStatus.AlreadyRedeemed) {
                    console.log(`Already redeemed code: ${code}`)
                    duplicates++
                }
                else if(codeResponse.status == CodeSubmitStatus.NotValidCombo) {
                    console.log(`Invalid code: ${code}`)
                    invalid++
                }
                else if(codeResponse.status == CodeSubmitStatus.Expired) {
                    console.log(`Expired code: ${code}`)
                    expired++
                }
                else{
                    console.log(`Sucessfully redeemed: ${code}`)
                    chests[codeResponse.chestType] = (chests[codeResponse.chestType] ? chests[codeResponse.chestType] : 0) + 1
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

        chrome.runtime.sendMessage({messageType: MessageType.Info, messageText:`Uploading... ${pendingCodes.length} codes left. This may take a bit.` })
    }

    console.log("Redeem complete:")
    console.log(`${duplicates} duplicate codes`)
    console.log(`${newCodes} new redemptions`)
    console.log(`${expired} expired`)
    console.log(`${invalid} invalid`)
    console.log(chests)
    chrome.runtime.sendMessage({
        messageType: MessageType.Success,
        chests: chests,
        messageText: `Upload completed successfully.<br>
                        ${duplicates > 0 ? `${duplicates} codes already redeemed<br>` : ""}
                        ${expired > 0 ? `${expired} expired codes<br>` : ""}
                        ${invalid > 0 ? `${invalid} invalid codes<br>` : ""}
                        ${newCodes} codes redeemed.`
    })
}