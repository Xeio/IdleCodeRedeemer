/// <reference path="./../lib/player_data.d.ts" />
/// <reference path="./../lib/redeem_code_response.d.ts" />
/// <reference path="./../lib/server_definitions.d.ts" />

interface CodeSubmitOptions{
    server: string;
    code: string;
    user_id: string;
    hash:string;
    instanceId: string;
}

interface GetuserdetailsOptions{
    server: string;
    user_id: string;
    hash:string;
}

class CodeSubmitResponse{
    status: CodeSubmitStatus;
    chestType?: ChestType;

    constructor(status: CodeSubmitStatus, chestType?: ChestType){
        this.status = status
        this.chestType = chestType
    }
}

enum CodeSubmitStatus{
    Success,
    OutdatedInstanceId,
    AlreadyRedeemed,
    InvalidParameters,
    NotValidCombo,
    Expired,
    Failed,
}

class IdleChampionsApi {
    private static MAX_CODES_QUOTA = 200
    private static CLIENT_VERSION = "999"
    private static NETWORK_ID = "21"
    private static LANGUAGE_ID = "1"

    static async getServer(): Promise<string> {
        let request = new URL('https://master.idlechampions.com/~idledragons/post.php')

        request.searchParams.append("call", "getPlayServerForDefinitions")
        request.searchParams.append("mobile_client_version", "999")
        request.searchParams.append("network_id", IdleChampionsApi.NETWORK_ID)
        request.searchParams.append("timestamp", "0")
        request.searchParams.append("request_id", "0")
        request.searchParams.append("localization_aware", "true")

        let response = await fetch(request.toString())
        if(response.ok){
            let serverDefs : ServerDefinitions = await response.json()
            return serverDefs.play_server + "post.php"
        }
        return null
    }

    static async submitCode(options: CodeSubmitOptions) : Promise<CodeSubmitResponse> {
        let request = new URL(options.server)

        request.searchParams.append("call", "redeemcoupon")
        request.searchParams.append("user_id", options.user_id)
        request.searchParams.append("hash", options.hash)
        request.searchParams.append("code", options.code)
        request.searchParams.append("instance_id", options.instanceId)
        request.searchParams.append("timestamp", "0")
        request.searchParams.append("request_id", "0")
        request.searchParams.append("language_id", IdleChampionsApi.LANGUAGE_ID)
        request.searchParams.append("network_id", IdleChampionsApi.NETWORK_ID)
        request.searchParams.append("mobile_client_version", IdleChampionsApi.CLIENT_VERSION)
        request.searchParams.append("localization_aware", "true")

        // http://ps1.idlechampions.com/~idledragons/post.php?call=redeemcoupon
        // &language_id=1
        // &user_id=
        // &hash=
        // &code=TACHROCHHEMP
        // &timestamp=122
        // &request_id=1234587
        // &network_id=21
        // &mobile_client_version=394
        // &localization_aware=true
        // &instance_id=

        let response = await fetch(request.toString())
        if(response.ok){
            let redeemResponse : RedeemCodeResponse = await response.json()
            console.debug(redeemResponse)
            if(redeemResponse.success && redeemResponse.failure_reason === FailureReason.AlreadyRedeemed){
                return new CodeSubmitResponse(CodeSubmitStatus.AlreadyRedeemed)
            }
            if(redeemResponse.success && redeemResponse.failure_reason === FailureReason.Expired){
                return new CodeSubmitResponse(CodeSubmitStatus.Expired)
            }
            if(redeemResponse.success && redeemResponse.failure_reason === FailureReason.NotValidCombo){
                return new CodeSubmitResponse(CodeSubmitStatus.NotValidCombo)
            }
            if (redeemResponse.success){
                let chestType = redeemResponse?.loot_details?.length > 0 ? redeemResponse.loot_details[0].chest_type_id : null
                return new CodeSubmitResponse(CodeSubmitStatus.Success, chestType)
            }
            if(!redeemResponse.success && redeemResponse.failure_reason === FailureReason.OutdatedInstanceId){
                return new CodeSubmitResponse(CodeSubmitStatus.OutdatedInstanceId)
            }
            if(!redeemResponse.success && redeemResponse.failure_reason === FailureReason.InvalidParameters){
                return new CodeSubmitResponse(CodeSubmitStatus.InvalidParameters)
            }
            console.error("Unknown failure reason")
            return new CodeSubmitResponse(CodeSubmitStatus.Failed)
        }
        return new CodeSubmitResponse(CodeSubmitStatus.Failed)
    }

    static async getUserDetails(options: GetuserdetailsOptions) : Promise<PlayerData> {
        let request = new URL(options.server)

        request.searchParams.append("call", "getuserdetails")
        request.searchParams.append("user_id", options.user_id)
        request.searchParams.append("hash", options.hash)
        request.searchParams.append("instance_key", "0")
        request.searchParams.append("include_free_play_objectives", "true")
        request.searchParams.append("timestamp", "0")
        request.searchParams.append("request_id", "0")
        request.searchParams.append("language_id", IdleChampionsApi.LANGUAGE_ID)
        request.searchParams.append("network_id", IdleChampionsApi.NETWORK_ID)
        request.searchParams.append("mobile_client_version", IdleChampionsApi.CLIENT_VERSION)
        request.searchParams.append("localization_aware", "true")

        // http://ps7.idlechampions.com/~idledragons/post.php?
        // call=getuserdetails
        // &language_id=1
        // &user_id=
        // &hash=
        // &instance_key=
        // &include_free_play_objectives=true
        // &timestamp=3
        // &request_id=122422033
        // &network_id=21
        // &mobile_client_version=396
        // &localization_aware=true&

        let response = await fetch(request.toString())
        if(response.ok){
            let playerData : PlayerData = await response.json()
            if(playerData.success){
                return playerData
            }
        }
        return null
    }
}