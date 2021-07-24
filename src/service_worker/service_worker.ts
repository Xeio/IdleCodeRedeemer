/// <reference path="./../lib/chrome.d.ts" />
/// <reference path="./../lib/player_data.d.ts" />
/// <reference path="./../lib/redeem_code_response.d.ts" />
/// <reference path="./../lib/server_definitions.d.ts" />
/// <reference path="./../shared/globals.ts" />
/// <reference path="./../shared/idle_champions_api.ts" />

chrome.action.setIcon({"path" : "media/icon-enabled.png"}, () => {})

chrome.runtime.onMessage.addListener(onMessage)

function onMessage(message: any, sender: any, sendResponse: any){
    if(message.messageType == "codes"){
        console.log("Code message received")

        chrome.storage.sync.get([Globals.SETTING_CODES, Globals.SETTING_PENDING], 
            ({redeemedCodes, pendingCodes}) => { handleDetectedCodes(redeemedCodes, pendingCodes, message.codes) }
        )
    }
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
}

let uploadRunning = false

function startUploadProcess(){
    if(uploadRunning) return;
    uploadRunning = true
    console.log("Beginning upload.")
    try{
        chrome.storage.sync.get(
            [Globals.SETTING_CODES, Globals.SETTING_PENDING, Globals.SETTING_INSTANCE_ID, Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], 
            ({redeemedCodes, pendingCodes, instanceId, userId, userHash}) => { uploadCodes(redeemedCodes, pendingCodes, instanceId, userId, userHash) }
        )
    }
    finally{
        uploadRunning = false
    }
}


async function uploadCodes(reedemedCodes: string[], pendingCodes: string[], instanceId: string, userId: string, hash: string) {
    let server = await IdleChampionsApi.getServer()

    if(!server) { 
        console.error("Failed to get idle champions server.")
        return
    }

    console.log(`Got server ${server}`)

    await new Promise(h => setTimeout(h, 3000)) //Delay between requests

    //Upload loop
    while(pendingCodes.length > 0){
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
                return
            case CodeSubmitStatus.AlreadyRedeemed:
            case CodeSubmitStatus.Success:
                if(codeResponse == CodeSubmitStatus.AlreadyRedeemed) {
                    console.log(`Already redeemed code: ${code}`)
                }
                else{
                    console.log(`Sucessfully redeemed: ${code}`)
                }

                reedemedCodes.push(code)
                chrome.storage.sync.set({[Globals.SETTING_CODES]: reedemedCodes, [Globals.SETTING_PENDING]: pendingCodes})
                
                break
        }

        await new Promise(h => setTimeout(h, 10000)) //Delay between requests
    }
}