/// <reference path="./../lib/chrome.d.ts" />
/// <reference path="./../lib/player_data.d.ts" />
/// <reference path="./../lib/redeem_code_response.d.ts" />
/// <reference path="./../lib/server_definitions.d.ts" />
/// <reference path="./../shared/globals.ts" />
/// <reference path="./idle_champions_api.ts" />

chrome.action.setIcon({"path" : "media/icon-enabled.png"}, () => {})

let _waitingForPort = false
let _port: chrome.runtime.Port

chrome.runtime.onConnect.addListener((port) => {
    if(_waitingForPort){
        console.log("New port opened, requesting codes.")
        _waitingForPort = false
        _port = port
        port.onMessage.addListener(onPortMessage)
        port.postMessage({messageType: MessageType.ScanCodes})
    }
    else{
        console.log("Unexpected port, disconnecting.")
        //We weren't expecting this port, so just disconnect it immediately
        port.disconnect()
    }
})

function onPortMessage(message: IdleMessage, port: chrome.runtime.Port){
    if(message.messageType == MessageType.Codes){
        console.log("Code message received")

        chrome.storage.sync.get([Globals.SETTING_CODES, Globals.SETTING_PENDING], 
            ({redeemedCodes, pendingCodes}) => { handleDetectedCodes(redeemedCodes, pendingCodes, message.codes) }
        )

        _port.postMessage({messageType: MessageType.CloseTab})
        _port.disconnect()
        _port = null
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

    //Upload loop
    let duplicates = 0
    let newCodes = 0
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

        if(codeResponse == CodeSubmitStatus.OutdatedInstanceId){
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

        switch(codeResponse){
            case CodeSubmitStatus.OutdatedInstanceId:
            case CodeSubmitStatus.Failed:
                console.error("Unable to submit code, aborting upload process.")
                chrome.runtime.sendMessage({messageType: MessageType.Error, messageText:"Failed to submit code for unknown reason."})
                return
            case CodeSubmitStatus.InvalidParameters:
                console.error("Unable to submit code due to invalid parameters.")
                chrome.runtime.sendMessage({messageType: MessageType.Error, messageText:"Failed to submit code, check user/hash on settings tab."})
                return
            case CodeSubmitStatus.AlreadyRedeemed:
            case CodeSubmitStatus.Success:
                if(codeResponse == CodeSubmitStatus.AlreadyRedeemed) {
                    console.log(`Already redeemed code: ${code}`)
                    duplicates++
                }
                else{
                    console.log(`Sucessfully redeemed: ${code}`)
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
    chrome.runtime.sendMessage({messageType: MessageType.Success, messageText: `Upload completed successfully.\n${duplicates > 0 ? `${duplicates} codes already redeemed` : ""}\n${newCodes} redeemed.`})
}