/// <reference path="./../shared/globals.ts" />
/// <reference path="./../lib/chrome.d.ts" />
/// <reference path="./../lib/redeem_code_response.d.ts" />
/// <reference path="./../shared/idle_champions_api.ts" />

document.addEventListener("DOMContentLoaded", loaded)

const REQUEST_DELAY = 2000

let _buyCountRange: HTMLInputElement, _buyCountNumber: HTMLInputElement
let _openCountRange: HTMLInputElement, _openCountNumber: HTMLInputElement
let _blacksmithCountRange: HTMLInputElement, _blacksmithCountNumber: HTMLInputElement

let _server: string | undefined
let _instanceId: string | undefined
let _userData: PlayerData | undefined
let _shownCloseClientWarning = false

let _blacksmithAggregate: BlacksmithAggregateResult

function loaded(){
    document.getElementById("refreshInventory")!.addEventListener('click', refreshClick)
    document.getElementById("purchaseButton")!.addEventListener('click', purchaseClick)
    document.getElementById("openButton")!.addEventListener('click', openClick)
    document.getElementById("blacksmithButton")!.addEventListener('click', blacksmithClick)

    document.getElementById("buyChestType")?.addEventListener('change', setMaximumValues)
    document.getElementById("openChestType")?.addEventListener('change', setMaximumValues)
    document.getElementById("blackithContracType")?.addEventListener('change', setMaximumValues)

    document.getElementById("heroId")?.addEventListener('change', updateSelectedHero)

    _buyCountRange = document.getElementById("buyCountRange") as HTMLInputElement
    _buyCountNumber = document.getElementById("buyCountNumber") as HTMLInputElement
    _buyCountRange.oninput = buyRangeChanged
    _buyCountNumber.oninput = buyNumberChanged

    _openCountRange = document.getElementById("openCountRange") as HTMLInputElement
    _openCountNumber = document.getElementById("openCountNumber") as HTMLInputElement
    _openCountRange.oninput = openRangeChanged
    _openCountNumber.oninput = openNumberChanged

    _blacksmithCountRange = document.getElementById("blacksmithCountRange") as HTMLInputElement
    _blacksmithCountNumber = document.getElementById("blacksmithCountNumber") as HTMLInputElement
    _blacksmithCountRange.oninput = blacksmithRangeChanged
    _blacksmithCountNumber.oninput = blacksmithNumberChanged
}

function buyRangeChanged(){
    _buyCountNumber.value = _buyCountRange.value
}

function buyNumberChanged(){
    if(parseInt(_buyCountNumber.value) > parseInt(_buyCountNumber.max)){
      _buyCountNumber.value = _buyCountNumber.max
    }
    _buyCountRange.value = _buyCountNumber.value
}

function openRangeChanged(){
    _openCountNumber.value = _openCountRange.value
}

function openNumberChanged(){
    if(parseInt(_openCountNumber.value) > parseInt(_openCountNumber.max)){
        _openCountNumber.value = _openCountNumber.max
    }
    _openCountRange.value = _openCountNumber.value
}

function blacksmithRangeChanged(){
    _blacksmithCountNumber.value = _blacksmithCountRange.value
}

function blacksmithNumberChanged(){
    if(parseInt(_blacksmithCountNumber.value) > parseInt(_blacksmithCountNumber.max)){
        _blacksmithCountNumber.value = _blacksmithCountNumber.max
    }
    _blacksmithCountRange.value = _blacksmithCountNumber.value
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
        showError("No credentials entered.")
        return
    }
    
    if(!_server){
        _server = await IdleChampionsApi.getServer()
        console.log(`Got server ${_server}`)
    }

    if(!_server) {
        showError("Failed to get idle champions server.")
        return
    }

    _userData = await IdleChampionsApi.getUserDetails({
        server: _server,
        user_id: userId,
        hash: hash,
    })

    if(!_userData) {
        showError("Failed to retreive user data.")
        return
    }

    if(_userData.switch_play_server)
    {
        console.log(`Got switch server to '${_userData.switch_play_server}'.`)

        _server = _userData.switch_play_server;

        _userData = await IdleChampionsApi.getUserDetails({
            server: _server,
            user_id: userId,
            hash: hash,
        })

        if(!_userData) {
            showError("Failed to retreive user data.")
            return
        }
    }

    console.log("Refreshed inventory data.")
    console.debug(_userData)

    _instanceId = _userData.details.instance_id
    chrome.storage.sync.set({[Globals.SETTING_INSTANCE_ID]: _userData.details.instance_id})

    document.getElementById("gemCount")!.textContent = _userData.details.red_rubies.toLocaleString()

    document.getElementById("silverChestCount")!.textContent = _userData.details.chests[ChestType.Silver]?.toLocaleString() || "0"
    document.getElementById("goldChestCount")!.textContent = _userData.details.chests[ChestType.Gold]?.toLocaleString() || "0"
    document.getElementById("electrumChestCount")!.textContent = _userData.details.chests[ChestType.Electrum]?.toLocaleString() || "0"

    document.getElementById("whiteBlacksmithCount")!.textContent = findBuffCount(ContractType.Tiny.toString()).toLocaleString() || "0"
    document.getElementById("greenBlacksmithCount")!.textContent = findBuffCount(ContractType.Small.toString()).toLocaleString() || "0"
    document.getElementById("blueBlacksmithCount")!.textContent = findBuffCount(ContractType.Medium.toString()).toLocaleString() || "0"
    document.getElementById("purpleBlacksmithCount")!.textContent = findBuffCount(ContractType.Large.toString()).toLocaleString() || "0"

    setMaximumValues()
    updateSelectedHero()

    document.getElementById("actionTabs")!.classList.add("show")
}

function findBuffCount(buff_id: string) : number {
    var countString = _userData?.details?.buffs?.find(b => b.buff_id == buff_id.toString())?.inventory_amount
    return parseInt(countString ?? "0")
}

function setMaximumValues(){
    if(!_userData) return

    const gems = _userData.details.red_rubies

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

    const chestType = (document.getElementById("openChestType") as HTMLSelectElement).value;
    const openMax = _userData.details.chests[chestType] ?? 0;

    (document.getElementById("openCountRange") as HTMLInputElement).max = openMax.toString();
    (document.getElementById("openCountRange") as HTMLInputElement).value = openMax.toString();
    (document.getElementById("openCountNumber") as HTMLInputElement).max = openMax.toString();
    (document.getElementById("openCountNumber") as HTMLInputElement).value = openMax.toString();

    const contractType = (document.getElementById("blackithContracType") as HTMLSelectElement).value;
    const blacksmithMax = findBuffCount(contractType);

    (document.getElementById("blacksmithCountRange") as HTMLInputElement).max = blacksmithMax.toString();
    (document.getElementById("blacksmithCountRange") as HTMLInputElement).value = blacksmithMax.toString();
    (document.getElementById("blacksmithCountNumber") as HTMLInputElement).max = blacksmithMax.toString();
    (document.getElementById("blacksmithCountNumber") as HTMLInputElement).value = blacksmithMax.toString();
}

function updateSelectedHero(){
    const heroId = (document.getElementById("heroId") as HTMLSelectElement).value

    if(_blacksmithAggregate?.heroId != heroId){
        _blacksmithAggregate = new BlacksmithAggregateResult(heroId, _userData)
    }
    else{
        _blacksmithAggregate.UpdateLevels(_userData)
    }

    displayBlacksmithResults()
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
    if(!_server) return

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

        const responseStatus : GenericResponse = await IdleChampionsApi.purchaseChests({
            server: _server,
            user_id: userId,
            hash: hash,
            chestTypeId: chestType,
            count: currentAmount
        })

        if(responseStatus.status == ResponseStatus.SwitchServer && responseStatus.newServer){
            _server = responseStatus.newServer
            remainingChests += currentAmount
            console.log("Switching server")
        }
        if(responseStatus.status == ResponseStatus.InsuficcientCurrency){
            showError("Insufficient gems remaining")
            return
        }
        else if(responseStatus.status == ResponseStatus.Failed){
            showError("Purchase failed")
            return
        }
        
        if(remainingChests > 0){
            await new Promise(h => setTimeout(h, REQUEST_DELAY)) //Delay between requests
        }
    }

    console.log("Completed purchase")

    await refreshInventory(userId, hash)

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

function blacksmithClick(){
    hideMessages()
    chrome.storage.sync.get(
        [Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], 
        ({userId, userHash}) => { 
            useBlacksmithContracts(userId, userHash)
        }
    )
}


async function openChests(userId: string, hash: string){
    const MAX_OPEN_AMOUNT = 1000

    if(!_server || !_instanceId) return

    if(!_shownCloseClientWarning){
        showOpenWarning("You MUST close the client before calling open chests. Click open again to confirm.")
        _shownCloseClientWarning = true
        return
    }
    _shownCloseClientWarning = false

    let lootResults = new LootAggregateResult()

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

        const openResponse: GenericResponse | OpenChestResponse = await IdleChampionsApi.openChests({
            server: _server,
            user_id: userId,
            hash: hash,
            chestTypeId: chestType,
            count: currentAmount,
            instanceId: _instanceId,
        })

        if("status" in openResponse){
            if(openResponse.status == ResponseStatus.SwitchServer && openResponse.newServer){
                _server = openResponse.newServer
                remainingChests += currentAmount
                console.log("Switching server")
            }
            if(openResponse.status == ResponseStatus.OutdatedInstanceId){
                const lastInstanceId:string = _instanceId
                console.log("Refreshing inventory for instance ID")
                await refreshInventory(userId, hash)
                if(_instanceId == lastInstanceId){
                    showError("Failed to get updated instance ID. Check credentials.")
                    return
                }

                remainingChests += currentAmount
            }
            else if(openResponse.status == ResponseStatus.Failed){
                showError("Purchase failed")
                return
            }
        }
        
        if("lootDetail" in openResponse){
            aggregateOpenResults(openResponse.lootDetail, lootResults)
        }

        displayLootResults(lootResults)

        if(remainingChests > 0){
            await new Promise(h => setTimeout(h, REQUEST_DELAY)) //Delay between requests
        }
    }

    console.log("Completed opening")

    await refreshInventory(userId, hash)

    showSuccess(`Opened ${chestAmount} chests`)
}

function hideMessages() {
    document.getElementById("error")!.classList.remove("show")
    document.getElementById("openWarning")!.classList.remove("show")
    document.getElementById("success")!.classList.remove("show")
    document.getElementById("info")!.classList.remove("show")
}

function showError(text:string){
    console.error(text)

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

class LootAggregateResult{
    gems = 0;
    shinies = 0;
    commonBounties = 0;
    uncommonBounties = 0;
    rareBounties = 0;
    epicBounties = 0;
    commonBlacksmith = 0;
    uncommonBlacksmith = 0;
    rareBlacksmith = 0;
    epicBlacksmith = 0;
}

function aggregateOpenResults(loot:LootDetailsEntity[], aggregateResult:LootAggregateResult){
    aggregateResult.shinies += loot.filter(l => l.gilded).length;

    aggregateResult.commonBounties += loot.filter(l => l.add_inventory_buff_id == 17).length;
    aggregateResult.uncommonBounties += loot.filter(l => l.add_inventory_buff_id == 18).length;
    aggregateResult.rareBounties += loot.filter(l => l.add_inventory_buff_id == 19).length;
    aggregateResult.epicBounties += loot.filter(l => l.add_inventory_buff_id == 20).length;

    aggregateResult.commonBlacksmith += loot.filter(l => l.add_inventory_buff_id == ContractType.Tiny).length;
    aggregateResult.uncommonBlacksmith += loot.filter(l => l.add_inventory_buff_id == ContractType.Small).length;
    aggregateResult.rareBlacksmith += loot.filter(l => l.add_inventory_buff_id == ContractType.Medium).length;
    aggregateResult.epicBlacksmith += loot.filter(l => l.add_inventory_buff_id == ContractType.Large).length;

    aggregateResult.gems += loot.reduce((count, l) => count + (l.add_soft_currency ?? 0), 0)
}

function displayLootResults(aggregateResult:LootAggregateResult){
    document.querySelector("#chestLoot tbody")!.innerHTML = ""

    addTableRow("Shinies", aggregateResult.shinies)
    addTableRow("Gems", aggregateResult.gems)

    addTableRow("Tiny Bounty Contract", aggregateResult.commonBounties, "rarity-common")
    addTableRow("Small Bounty Contract", aggregateResult.uncommonBounties, "rarity-uncommon")
    addTableRow("Medium Bounty Contract", aggregateResult.rareBounties, "rarity-rare")
    addTableRow("Large Bounty Contract", aggregateResult.epicBounties, "rarity-epic")

    addTableRow("Tiny Blacksmithing Contract", aggregateResult.commonBlacksmith, "rarity-common")
    addTableRow("Small Blacksmithing Contract", aggregateResult.uncommonBlacksmith, "rarity-uncommon")
    addTableRow("Medium Blacksmithing Contract", aggregateResult.rareBlacksmith, "rarity-rare")
    addTableRow("Large Blacksmithing Contract", aggregateResult.epicBlacksmith, "rarity-epic")
}

function addTableRow(text:string, amount:number, style?:string){
    if(amount == 0) return

    let tbody = document.querySelector("#chestLoot tbody") as HTMLTableSectionElement

    tbody.append(buildTableRow(text, amount, style))
}

function buildTableRow(label: string, amount: number, style?:string) : HTMLTableRowElement{
    const labelColumn = document.createElement("td")
    labelColumn.innerText = label

    const amountColumn = document.createElement("td")
    amountColumn.innerText = amount.toString()

    const row = document.createElement("tr")
    if(style){
        row.classList.add(style)
    }
    row.appendChild(labelColumn)
    row.appendChild(amountColumn)

    return row
}

class BlacksmithAggregateResult{
    heroId: string;
    slotResult = new Array(7);
    slotEndValue = new Array(7);

    constructor(heroId: string, userData: PlayerData | undefined){
        this.heroId = heroId
        this.UpdateLevels(userData)
    }

    public UpdateLevels(userData: PlayerData | undefined){
        userData?.details?.loot?.filter(l => l.hero_id == parseInt(this.heroId)).forEach(lootItem => {
            this.slotEndValue[lootItem.slot_id] = lootItem.enchant + 1
        })
    }
}

async function useBlacksmithContracts(userId: string, hash: string){
    const MAX_BLACKSMITH_AMOUNT = 50

    if(!_server || !_instanceId) return

    const contractType = <any>(document.getElementById("blackithContracType") as HTMLSelectElement).value as ContractType
    const heroId = (document.getElementById("heroId") as HTMLSelectElement).value
    const blacksmithAmount = parseInt(_blacksmithCountRange.value) || 0

    updateSelectedHero()

    if(!contractType || !heroId || blacksmithAmount < 1){
        return
    }

    let remainingContracts = blacksmithAmount
    //Have to batch these into max of 100 at a time
    while(remainingContracts > 0){
        showInfo(`Smithing... ${remainingContracts} contracts remaining to use`)
        
        const currentAmount = Math.min(remainingContracts, MAX_BLACKSMITH_AMOUNT)
        remainingContracts -= currentAmount

        console.log(`Using ${currentAmount} contracts`)

        const blacksmithResponse: GenericResponse | UseBlacksmithResponse = await IdleChampionsApi.useBlacksmith({
            server: _server,
            user_id: userId,
            hash: hash,
            heroId: heroId,
            contractType: contractType,
            count: currentAmount,
            instanceId: _instanceId,
        })

        if("status" in blacksmithResponse){
            if(blacksmithResponse.status == ResponseStatus.SwitchServer && blacksmithResponse.newServer){
                _server = blacksmithResponse.newServer
                remainingContracts += currentAmount
                console.log("Switching server")
            }
            if(blacksmithResponse.status == ResponseStatus.OutdatedInstanceId){
                const lastInstanceId:string = _instanceId
                console.log("Refreshing inventory for instance ID")
                await refreshInventory(userId, hash)
                if(_instanceId == lastInstanceId){
                    showError("Failed to get updated instance ID. Check credentials.")
                    return
                }

                remainingContracts += currentAmount
            }
            else if(blacksmithResponse.status == ResponseStatus.Failed){
                showError("Blacksmithing failed")
                return
            }
        }
        
        if("actions" in blacksmithResponse){
            aggregateBlacksmithResults(blacksmithResponse.actions)
        }

        displayBlacksmithResults()

        if(remainingContracts > 0){
            await new Promise(h => setTimeout(h, REQUEST_DELAY)) //Delay between requests
        }
    }

    console.log("Completed blacksmithing")

    await refreshInventory(userId, hash)

    showSuccess(`Used ${blacksmithAmount} blacksmith contracts`)
}

function aggregateBlacksmithResults(blacksmithActions:BlacksmithAction[]){
    blacksmithActions.forEach(action => {
        if(action.action == "level_up_loot"){
            var newLevels = parseInt(action.amount)
            _blacksmithAggregate.slotResult[action.slot_id] = (_blacksmithAggregate.slotResult[action.slot_id] ?? 0) + newLevels
            _blacksmithAggregate.slotEndValue[action.slot_id] = action.enchant_level + 1
        }
    })
}

function displayBlacksmithResults(){
    document.querySelector("#blacksmithResults tbody")!.innerHTML = ""

    for(let i = 1; i <= 6; i++){
        addBlacksmithTableRow("Slot " + i, _blacksmithAggregate.slotResult[i], _blacksmithAggregate.slotEndValue[i])
    }
}

function addBlacksmithTableRow(text:string, amount:number, newLevel: number, style?:string){
    let tbody = document.querySelector("#blacksmithResults tbody") as HTMLTableSectionElement

    tbody.append(buildBlacksmithTableRow(text, amount, newLevel, style))
}

function buildBlacksmithTableRow(slotName: string, addedLevels: number, newLevel: number, style?:string) : HTMLTableRowElement{
    const slotColumn = document.createElement("td")
    slotColumn.innerText = slotName

    const addedLevelsColumn = document.createElement("td")
    addedLevelsColumn.innerText = addedLevels?.toString() || "0"

    const newLevelColumn = document.createElement("td")
    newLevelColumn.innerText = newLevel?.toString() || "0"

    const row = document.createElement("tr")
    if(style){
        row.classList.add(style)
    }
    row.appendChild(slotColumn)
    row.appendChild(addedLevelsColumn)
    row.appendChild(newLevelColumn)

    return row
}