/// <reference path="./../lib/chrome.d.ts" />
/// <reference path="./../lib/server_definitions.d.ts" />
/// <reference path="./../shared/globals.ts" />

let _timeout = 0

const CODES_SETTING = "codes"
const UNUPLOADED_SETTING = "unuploaded"
const USERDATA_SETTING = "userdata"

const MAX_CODES_QUOTA = 200

console.debug("Testing:" + Globals.debugMode)

chrome.action.setIcon({"path" : "media/icon-enabled.png"}, () => {});

chrome.runtime.onMessage.addListener(onMessage);

function onMessage(request, sender, sendResponse){
    if(request.messageType == "codes"){
        console.log("Code message received");

        clearTimeout(_timeout);
        chrome.storage.sync.get([CODES_SETTING], ({codes}) => { newCodeAlarmUpload(codes, request.codes); });
    }
}

function newCodeAlarmUpload(codes, detectedCodes){
    if(!detectedCodes) return;
    if(detectedCodes.length == 0) return; //Stop the loop

    if(!codes) codes = []

    //TODO: Bettter loop?

    let newCodes = []

    while(detectedCodes.length > 0){
        let code = detectedCodes.pop()

        if(codes.indexOf(code) == -1){
            //New code
            console.log("New code detected: " + code)

            console.log("Uploading code: " + code)
        
            newCodes.push(code);

            //TODO: Upload process

            //TODO: Need a delay here somewhere between uploads?

            //Stop processing till a delay happens
            return;
        }
        else{
            console.debug("Duplicate code: " + code);
        }
    }

    if(newCodes.length > 0){
        console.log("New codes detected, saving list.");
        
        chrome.storage.sync.set({UNUPLOADED_SETTING: newCodes}, () => {
            clearTimeout(_timeout);
            _timeout = setTimeout(() => { newCodeAlarmUpload(codes, detectedCodes); }, 5000);
        });
    }
}

let server = "https://ps7.idlechampions.com/~idledragons/post.php"

async function getServer(): Promise<string> {
    let request = new URL('https://master.idlechampions.com/~idledragons/post.php')

    request.searchParams.append("call", "getPlayServerForDefinitions")
    request.searchParams.append("mobile_client_version", "999")

    let response = await fetch(request.toString())
    if(response.ok){
        let serverDefs : ServerDefinitions = await response.json()
        server = serverDefs.play_server + "/post.php"
        return serverDefs.play_server
    }
    return null
}

async function uploadCode() {
    //TODO: Upload
    //fetch()
    

    //TODO: If fail, refresh instance, then retry
    
    await new Promise(r => setTimeout(r, 2000))
}

//TODO: Alarm to loop over new codes?