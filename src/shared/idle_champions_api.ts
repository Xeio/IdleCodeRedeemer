/// <reference path="./../lib/player_data.d.ts" />
/// <reference path="./../lib/redeem_code_response.d.ts" />
/// <reference path="./../lib/server_definitions.d.ts" />
/// <reference path="./../lib/blacksmith_response.d.ts" />

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

interface OpenChestsOptions{
    server: string;
    user_id: string;
    hash:string;
    chestTypeId: ChestType;
    count: number;
    instanceId: string;
}

interface PurchaseChestsOptions{
    server: string;
    user_id: string;
    hash:string;
    chestTypeId: ChestType;
    count: number;
}

interface UseBlacksmithOptions{
    server: string;
    user_id: string;
    hash: string;
    contractType: ContractType;
    heroId: string;
    count: number;
    instanceId: string;
}

declare const enum ContractType{
    Tiny = 31,
    Small = 32,
    Medium = 33,
    Large = 34,
}

class GenericResponse
{
    status: ResponseStatus;
    newServer?: string;

    constructor(status: ResponseStatus, newServer?: string){
        this.status = status
        this.newServer = newServer ? newServer + "post.php" : undefined
    }
}

class CodeSubmitResponse {
    codeStatus: CodeSubmitStatus;
    lootDetail?: LootDetail[];

    constructor(codeStatus: CodeSubmitStatus, lootDetail?: LootDetail[]){
        this.codeStatus = codeStatus
        this.lootDetail = lootDetail
    }
}

class OpenChestResponse {
    lootDetail: LootDetailsEntity[];

    constructor(lootDetail: LootDetailsEntity[]){
        this.lootDetail = lootDetail
    }
}

class UseBlacksmithResponse {
    actions: BlacksmithAction[];

    constructor(actions: BlacksmithAction[]){
        this.actions = actions
    }
}

enum CodeSubmitStatus{
    Success,
    AlreadyRedeemed,
    InvalidParameters,
    NotValidCombo,
    Expired,
    CannotRedeem,
}

enum ResponseStatus{
    Success,
    OutdatedInstanceId,
    Failed,
    InsuficcientCurrency,
    SwitchServer,
}

class IdleChampionsApi {
    private static CLIENT_VERSION = "999"
    private static NETWORK_ID = "21"
    private static LANGUAGE_ID = "1"
    public static readonly MAX_BUY_CHESTS = 250

    static async getServer(): Promise<string | undefined> {
        const request = new URL('https://master.idlechampions.com/~idledragons/post.php')

        request.searchParams.append("call", "getPlayServerForDefinitions")
        request.searchParams.append("mobile_client_version", "999")
        request.searchParams.append("network_id", IdleChampionsApi.NETWORK_ID)
        request.searchParams.append("timestamp", "0")
        request.searchParams.append("request_id", "0")
        request.searchParams.append("localization_aware", "true")

        const response = await fetch(request.toString())
        if(response.ok){
            const serverDefs : ServerDefinitions = await IdleChampionsApi.tryToJson(response)
            if(serverDefs){
                return serverDefs.play_server + "post.php"
            }
        }
        return undefined
    }

    static async submitCode(options: CodeSubmitOptions) : Promise<GenericResponse | CodeSubmitResponse> {
        const request = new URL(options.server)

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

        const response = await fetch(request.toString())
        if(response.ok){
            const redeemResponse : RedeemCodeResponse = await IdleChampionsApi.tryToJson(response)
            if(!redeemResponse){
                return new GenericResponse(ResponseStatus.Failed)
            }
            console.debug(redeemResponse)
            if(redeemResponse.switch_play_server){
                return new GenericResponse(ResponseStatus.SwitchServer, redeemResponse.switch_play_server)
            }
            if(redeemResponse.failure_reason === FailureReason.AlreadyRedeemed ||
                redeemResponse.failure_reason === FailureReason.SomeoneAlreadyRedeemed){
                return new CodeSubmitResponse(CodeSubmitStatus.AlreadyRedeemed)
            }
            if(redeemResponse.failure_reason === FailureReason.Expired){
                return new CodeSubmitResponse(CodeSubmitStatus.Expired)
            }
            if(redeemResponse.failure_reason === FailureReason.NotValidCombo){
                return new CodeSubmitResponse(CodeSubmitStatus.NotValidCombo)
            }
            if(redeemResponse.failure_reason === FailureReason.OutdatedInstanceId){
                return new GenericResponse(ResponseStatus.OutdatedInstanceId)
            }
            if(redeemResponse.failure_reason === FailureReason.InvalidParameters){
                return new CodeSubmitResponse(CodeSubmitStatus.InvalidParameters)
            }
            if(redeemResponse.failure_reason === FailureReason.CannotRedeem){
                return new CodeSubmitResponse(CodeSubmitStatus.CannotRedeem)
            }
            if (redeemResponse.success && redeemResponse.okay){
                return new CodeSubmitResponse(CodeSubmitStatus.Success, redeemResponse?.loot_details)
            }
            console.error("Unknown failure reason")
            return new GenericResponse(ResponseStatus.Failed)
        }
        return new GenericResponse(ResponseStatus.Failed)
    }

    static async getUserDetails(options: GetuserdetailsOptions) : Promise<GenericResponse | PlayerData> {
        const request = new URL(options.server)

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

        const response = await fetch(request.toString())
        if(response.ok){
            const playerData : PlayerData = await IdleChampionsApi.tryToJson(response)
            if(playerData.switch_play_server){
                return new GenericResponse(ResponseStatus.SwitchServer, playerData.switch_play_server)
            }
            if(playerData?.success){
                return playerData
            }
        }
        return new GenericResponse(ResponseStatus.Failed)
    }

    static async openChests(options: OpenChestsOptions) : Promise<GenericResponse | OpenChestResponse> {
        const request = new URL(options.server)

        request.searchParams.append("call", "openGenericChest")
        request.searchParams.append("user_id", options.user_id)
        request.searchParams.append("hash", options.hash)
        request.searchParams.append("chest_type_id", options.chestTypeId.toString())
        request.searchParams.append("count", options.count.toString())
        request.searchParams.append("instance_id", options.instanceId)
        request.searchParams.append("gold_per_second", "0.00")
        request.searchParams.append("game_instance_id", "1")
        request.searchParams.append("checksum", "d99242bc7924646a5e069bc39eeb735b") //A buttery smooth checksum
        request.searchParams.append("timestamp", "0")
        request.searchParams.append("request_id", "0")
        request.searchParams.append("language_id", IdleChampionsApi.LANGUAGE_ID)
        request.searchParams.append("network_id", IdleChampionsApi.NETWORK_ID)
        request.searchParams.append("localization_aware", "true")

        // http://ps7.idlechampions.com/~idledragons/post.php?
        // call=opengenericchest&
        // gold_per_second=&
        // checksum=&
        // user_id=&
        // hash=&
        // instance_id=&
        // chest_type_id=1&
        // game_instance_id=1&
        // count=12

        const response = await fetch(request.toString())
        if(response.ok){
            const openGenericChestResponse : OpenGenericChestResponse = await IdleChampionsApi.tryToJson(response)
            if(!openGenericChestResponse){
                return new GenericResponse(ResponseStatus.Failed)
            }
            console.debug(openGenericChestResponse)
            if(openGenericChestResponse.switch_play_server){
                return new GenericResponse(ResponseStatus.SwitchServer, openGenericChestResponse.switch_play_server)
            }
            if(openGenericChestResponse.failure_reason == FailureReason.OutdatedInstanceId){
                return new GenericResponse(ResponseStatus.OutdatedInstanceId)
            }
            if(openGenericChestResponse.success && openGenericChestResponse.loot_details){
                return new OpenChestResponse(openGenericChestResponse.loot_details)
            }
        }
        return new GenericResponse(ResponseStatus.Failed)
    }

    static async purchaseChests(options: PurchaseChestsOptions) : Promise<GenericResponse> {
        const request = new URL(options.server)

        if(options.count > IdleChampionsApi.MAX_BUY_CHESTS) throw new Error("Count limited to IdleChampionsApi.MAX_BUY_CHESTS purchased per call.")

        request.searchParams.append("call", "buysoftcurrencychest")
        request.searchParams.append("user_id", options.user_id)
        request.searchParams.append("hash", options.hash)
        request.searchParams.append("chest_type_id", options.chestTypeId.toString())
        request.searchParams.append("count", options.count.toString())

        request.searchParams.append("timestamp", "0")
        request.searchParams.append("request_id", "0")
        request.searchParams.append("network_id", IdleChampionsApi.NETWORK_ID)
        request.searchParams.append("localization_aware", "true")
        request.searchParams.append("mobile_client_version", "999")
        request.searchParams.append("language_id", IdleChampionsApi.LANGUAGE_ID)

        // Request URI Query Parameter: call=buysoftcurrencychest
        // Request URI Query Parameter: language_id=1
        // Request URI Query Parameter: user_id=
        // Request URI Query Parameter: hash=
        // Request URI Query Parameter: chest_type_id=2
        // Request URI Query Parameter: count=3
        // Request URI Query Parameter: timestamp=
        // Request URI Query Parameter: request_id=
        // Request URI Query Parameter: network_id=21
        // Request URI Query Parameter: mobile_client_version=399
        // Request URI Query Parameter: localization_aware=true
        // Request URI Query Parameter: instance_id=

        const response = await fetch(request.toString())
        if(response.ok){
            const purchaseResponse : PurchaseChestResponse = await IdleChampionsApi.tryToJson(response)
            if(!purchaseResponse){
                return new GenericResponse(ResponseStatus.Failed)
            }
            console.debug(purchaseResponse)
            if(purchaseResponse.switch_play_server){
                return new GenericResponse(ResponseStatus.SwitchServer, purchaseResponse.switch_play_server)
            }
            if(purchaseResponse.failure_reason == FailureReason.NotEnoughCurrency){
                return new GenericResponse(ResponseStatus.InsuficcientCurrency)
            }
            if(purchaseResponse.success && purchaseResponse.okay){
                return new GenericResponse(ResponseStatus.Success)
            }
        }
        return new GenericResponse(ResponseStatus.Failed)
    }

    static async useBlacksmith(options: UseBlacksmithOptions) : Promise<GenericResponse | UseBlacksmithResponse> {
        const request = new URL(options.server)

        request.searchParams.append("call", "useServerBuff")
        request.searchParams.append("user_id", options.user_id)
        request.searchParams.append("hash", options.hash)
        request.searchParams.append("buff_id", options.contractType.toString())
        request.searchParams.append("hero_id", options.heroId)
        request.searchParams.append("num_uses", options.count.toString())
        request.searchParams.append("instance_id", options.instanceId)
        request.searchParams.append("game_instance_id", "1")
        request.searchParams.append("timestamp", "0")
        request.searchParams.append("request_id", "0")
        request.searchParams.append("language_id", IdleChampionsApi.LANGUAGE_ID)
        request.searchParams.append("network_id", IdleChampionsApi.NETWORK_ID)
        request.searchParams.append("localization_aware", "true")

        const response = await fetch(request.toString())
        if(response.ok){
            const useServerBuffResponse : UseServerBuffResponse = await IdleChampionsApi.tryToJson(response)
            if(!useServerBuffResponse){
                return new GenericResponse(ResponseStatus.Failed)
            }
            console.debug(useServerBuffResponse)
            if(useServerBuffResponse.switch_play_server){
                return new GenericResponse(ResponseStatus.SwitchServer, useServerBuffResponse.switch_play_server)
            }
            if(useServerBuffResponse.failure_reason == FailureReason.OutdatedInstanceId){
                return new GenericResponse(ResponseStatus.OutdatedInstanceId)
            }
            if(useServerBuffResponse.success && useServerBuffResponse.okay){
                return new UseBlacksmithResponse(useServerBuffResponse.actions)
            }
        }
        return new GenericResponse(ResponseStatus.Failed)
    }

    static async tryToJson(response: Response) : Promise<any> {
        try{
            return await response.json()
        }
        catch(e){
            console.error(e)
            return null
        }
    }

    static isGenericResponse(response: GenericResponse | any): response is GenericResponse{
        return response instanceof GenericResponse;
    }
}