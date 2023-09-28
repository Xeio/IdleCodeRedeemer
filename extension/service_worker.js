"use strict";
var Globals = (function () {
    function Globals() {
    }
    Globals.debugMode = !chrome.runtime.getManifest().update_url;
    Globals.discordChannelUrl = "https://discord.com/channels/357247482247380994/358044869685673985";
    Globals.SETTING_CODES = "redeemedCodes";
    Globals.SETTING_PENDING = "pendingCodes";
    Globals.SETTING_INSTANCE_ID = "instanceId";
    Globals.SETTING_USER_HASH = "userHash";
    Globals.SETTING_USER_ID = "userId";
    return Globals;
}());
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var GenericResponse = (function () {
    function GenericResponse(status, newServer) {
        this.status = status;
        this.newServer = newServer ? newServer + "post.php" : undefined;
    }
    return GenericResponse;
}());
var CodeSubmitResponse = (function () {
    function CodeSubmitResponse(codeStatus, lootDetail) {
        this.codeStatus = codeStatus;
        this.lootDetail = lootDetail;
    }
    return CodeSubmitResponse;
}());
var OpenChestResponse = (function () {
    function OpenChestResponse(lootDetail) {
        this.lootDetail = lootDetail;
    }
    return OpenChestResponse;
}());
var UseBlacksmithResponse = (function () {
    function UseBlacksmithResponse(actions) {
        this.actions = actions;
    }
    return UseBlacksmithResponse;
}());
var CodeSubmitStatus;
(function (CodeSubmitStatus) {
    CodeSubmitStatus[CodeSubmitStatus["Success"] = 0] = "Success";
    CodeSubmitStatus[CodeSubmitStatus["AlreadyRedeemed"] = 1] = "AlreadyRedeemed";
    CodeSubmitStatus[CodeSubmitStatus["InvalidParameters"] = 2] = "InvalidParameters";
    CodeSubmitStatus[CodeSubmitStatus["NotValidCombo"] = 3] = "NotValidCombo";
    CodeSubmitStatus[CodeSubmitStatus["Expired"] = 4] = "Expired";
    CodeSubmitStatus[CodeSubmitStatus["CannotRedeem"] = 5] = "CannotRedeem";
})(CodeSubmitStatus || (CodeSubmitStatus = {}));
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus[ResponseStatus["Success"] = 0] = "Success";
    ResponseStatus[ResponseStatus["OutdatedInstanceId"] = 1] = "OutdatedInstanceId";
    ResponseStatus[ResponseStatus["Failed"] = 2] = "Failed";
    ResponseStatus[ResponseStatus["InsuficcientCurrency"] = 3] = "InsuficcientCurrency";
    ResponseStatus[ResponseStatus["SwitchServer"] = 4] = "SwitchServer";
})(ResponseStatus || (ResponseStatus = {}));
var IdleChampionsApi = (function () {
    function IdleChampionsApi() {
    }
    IdleChampionsApi.getServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, serverDefs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new URL('https://master.idlechampions.com/~idledragons/post.php');
                        request.searchParams.append("call", "getPlayServerForDefinitions");
                        request.searchParams.append("mobile_client_version", "999");
                        request.searchParams.append("network_id", IdleChampionsApi.NETWORK_ID);
                        request.searchParams.append("timestamp", "0");
                        request.searchParams.append("request_id", "0");
                        request.searchParams.append("localization_aware", "true");
                        return [4, fetch(request.toString())];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3, 3];
                        return [4, IdleChampionsApi.tryToJson(response)];
                    case 2:
                        serverDefs = _a.sent();
                        if (serverDefs) {
                            return [2, serverDefs.play_server + "post.php"];
                        }
                        _a.label = 3;
                    case 3: return [2, undefined];
                }
            });
        });
    };
    IdleChampionsApi.submitCode = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, redeemResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new URL(options.server);
                        request.searchParams.append("call", "redeemcoupon");
                        request.searchParams.append("user_id", options.user_id);
                        request.searchParams.append("hash", options.hash);
                        request.searchParams.append("code", options.code);
                        request.searchParams.append("instance_id", options.instanceId);
                        request.searchParams.append("timestamp", "0");
                        request.searchParams.append("request_id", "0");
                        request.searchParams.append("language_id", IdleChampionsApi.LANGUAGE_ID);
                        request.searchParams.append("network_id", IdleChampionsApi.NETWORK_ID);
                        request.searchParams.append("mobile_client_version", IdleChampionsApi.CLIENT_VERSION);
                        request.searchParams.append("localization_aware", "true");
                        return [4, fetch(request.toString())];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3, 3];
                        return [4, IdleChampionsApi.tryToJson(response)];
                    case 2:
                        redeemResponse = _a.sent();
                        if (!redeemResponse) {
                            return [2, new GenericResponse(ResponseStatus.Failed)];
                        }
                        console.debug(redeemResponse);
                        if (redeemResponse.switch_play_server) {
                            return [2, new GenericResponse(ResponseStatus.SwitchServer, redeemResponse.switch_play_server)];
                        }
                        if (redeemResponse.failure_reason === "you_already_redeemed_combination" ||
                            redeemResponse.failure_reason === "someone_already_redeemed_combination") {
                            return [2, new CodeSubmitResponse(CodeSubmitStatus.AlreadyRedeemed)];
                        }
                        if (redeemResponse.failure_reason === "offer_has_expired") {
                            return [2, new CodeSubmitResponse(CodeSubmitStatus.Expired)];
                        }
                        if (redeemResponse.failure_reason === "not_valid_combination") {
                            return [2, new CodeSubmitResponse(CodeSubmitStatus.NotValidCombo)];
                        }
                        if (redeemResponse.failure_reason === "Outdated instance id") {
                            return [2, new GenericResponse(ResponseStatus.OutdatedInstanceId)];
                        }
                        if (redeemResponse.failure_reason === "Invalid or incomplete parameters") {
                            return [2, new CodeSubmitResponse(CodeSubmitStatus.InvalidParameters)];
                        }
                        if (redeemResponse.failure_reason === "can_not_redeem_combination") {
                            return [2, new CodeSubmitResponse(CodeSubmitStatus.CannotRedeem)];
                        }
                        if (redeemResponse.success && redeemResponse.okay) {
                            return [2, new CodeSubmitResponse(CodeSubmitStatus.Success, redeemResponse === null || redeemResponse === void 0 ? void 0 : redeemResponse.loot_details)];
                        }
                        console.error("Unknown failure reason");
                        return [2, new GenericResponse(ResponseStatus.Failed)];
                    case 3: return [2, new GenericResponse(ResponseStatus.Failed)];
                }
            });
        });
    };
    IdleChampionsApi.getUserDetails = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, playerData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new URL(options.server);
                        request.searchParams.append("call", "getuserdetails");
                        request.searchParams.append("user_id", options.user_id);
                        request.searchParams.append("hash", options.hash);
                        request.searchParams.append("instance_key", "0");
                        request.searchParams.append("include_free_play_objectives", "true");
                        request.searchParams.append("timestamp", "0");
                        request.searchParams.append("request_id", "0");
                        request.searchParams.append("language_id", IdleChampionsApi.LANGUAGE_ID);
                        request.searchParams.append("network_id", IdleChampionsApi.NETWORK_ID);
                        request.searchParams.append("mobile_client_version", IdleChampionsApi.CLIENT_VERSION);
                        request.searchParams.append("localization_aware", "true");
                        return [4, fetch(request.toString())];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3, 3];
                        return [4, IdleChampionsApi.tryToJson(response)];
                    case 2:
                        playerData = _a.sent();
                        if (playerData.switch_play_server) {
                            return [2, new GenericResponse(ResponseStatus.SwitchServer, playerData.switch_play_server)];
                        }
                        if (playerData === null || playerData === void 0 ? void 0 : playerData.success) {
                            return [2, playerData];
                        }
                        _a.label = 3;
                    case 3: return [2, new GenericResponse(ResponseStatus.Failed)];
                }
            });
        });
    };
    IdleChampionsApi.openChests = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, openGenericChestResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new URL(options.server);
                        if (options.count > IdleChampionsApi.MAX_OPEN_CHESTS)
                            throw new Error("Count limited to IdleChampionsApi.MAX_OPEN_CHESTS opened per call.");
                        request.searchParams.append("call", "openGenericChest");
                        request.searchParams.append("user_id", options.user_id);
                        request.searchParams.append("hash", options.hash);
                        request.searchParams.append("chest_type_id", options.chestTypeId.toString());
                        request.searchParams.append("count", options.count.toString());
                        request.searchParams.append("instance_id", options.instanceId);
                        request.searchParams.append("gold_per_second", "0.00");
                        request.searchParams.append("game_instance_id", "1");
                        request.searchParams.append("checksum", "d99242bc7924646a5e069bc39eeb735b");
                        request.searchParams.append("timestamp", "0");
                        request.searchParams.append("request_id", "0");
                        request.searchParams.append("language_id", IdleChampionsApi.LANGUAGE_ID);
                        request.searchParams.append("network_id", IdleChampionsApi.NETWORK_ID);
                        request.searchParams.append("localization_aware", "true");
                        return [4, fetch(request.toString())];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3, 3];
                        return [4, IdleChampionsApi.tryToJson(response)];
                    case 2:
                        openGenericChestResponse = _a.sent();
                        if (!openGenericChestResponse) {
                            return [2, new GenericResponse(ResponseStatus.Failed)];
                        }
                        console.debug(openGenericChestResponse);
                        if (openGenericChestResponse.switch_play_server) {
                            return [2, new GenericResponse(ResponseStatus.SwitchServer, openGenericChestResponse.switch_play_server)];
                        }
                        if (openGenericChestResponse.failure_reason == "Outdated instance id") {
                            return [2, new GenericResponse(ResponseStatus.OutdatedInstanceId)];
                        }
                        if (openGenericChestResponse.success && openGenericChestResponse.loot_details) {
                            return [2, new OpenChestResponse(openGenericChestResponse.loot_details)];
                        }
                        _a.label = 3;
                    case 3: return [2, new GenericResponse(ResponseStatus.Failed)];
                }
            });
        });
    };
    IdleChampionsApi.purchaseChests = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, purchaseResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new URL(options.server);
                        if (options.count > IdleChampionsApi.MAX_BUY_CHESTS)
                            throw new Error("Count limited to IdleChampionsApi.MAX_BUY_CHESTS purchased per call.");
                        request.searchParams.append("call", "buysoftcurrencychest");
                        request.searchParams.append("user_id", options.user_id);
                        request.searchParams.append("hash", options.hash);
                        request.searchParams.append("chest_type_id", options.chestTypeId.toString());
                        request.searchParams.append("count", options.count.toString());
                        request.searchParams.append("timestamp", "0");
                        request.searchParams.append("request_id", "0");
                        request.searchParams.append("network_id", IdleChampionsApi.NETWORK_ID);
                        request.searchParams.append("localization_aware", "true");
                        request.searchParams.append("mobile_client_version", "999");
                        request.searchParams.append("language_id", IdleChampionsApi.LANGUAGE_ID);
                        return [4, fetch(request.toString())];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3, 3];
                        return [4, IdleChampionsApi.tryToJson(response)];
                    case 2:
                        purchaseResponse = _a.sent();
                        if (!purchaseResponse) {
                            return [2, new GenericResponse(ResponseStatus.Failed)];
                        }
                        console.debug(purchaseResponse);
                        if (purchaseResponse.switch_play_server) {
                            return [2, new GenericResponse(ResponseStatus.SwitchServer, purchaseResponse.switch_play_server)];
                        }
                        if (purchaseResponse.failure_reason == "Not enough currency") {
                            return [2, new GenericResponse(ResponseStatus.InsuficcientCurrency)];
                        }
                        if (purchaseResponse.success && purchaseResponse.okay) {
                            return [2, new GenericResponse(ResponseStatus.Success)];
                        }
                        _a.label = 3;
                    case 3: return [2, new GenericResponse(ResponseStatus.Failed)];
                }
            });
        });
    };
    IdleChampionsApi.useBlacksmith = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, useServerBuffResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new URL(options.server);
                        if (options.count > IdleChampionsApi.MAX_BLACKSMITH)
                            throw new Error("Count limited to IdleChampionsApi.MAX_BLACKSMITH per call.");
                        request.searchParams.append("call", "useServerBuff");
                        request.searchParams.append("user_id", options.user_id);
                        request.searchParams.append("hash", options.hash);
                        request.searchParams.append("buff_id", options.contractType.toString());
                        request.searchParams.append("hero_id", options.heroId);
                        request.searchParams.append("num_uses", options.count.toString());
                        request.searchParams.append("instance_id", options.instanceId);
                        request.searchParams.append("game_instance_id", "1");
                        request.searchParams.append("timestamp", "0");
                        request.searchParams.append("request_id", "0");
                        request.searchParams.append("language_id", IdleChampionsApi.LANGUAGE_ID);
                        request.searchParams.append("network_id", IdleChampionsApi.NETWORK_ID);
                        request.searchParams.append("localization_aware", "true");
                        return [4, fetch(request.toString())];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3, 3];
                        return [4, IdleChampionsApi.tryToJson(response)];
                    case 2:
                        useServerBuffResponse = _a.sent();
                        if (!useServerBuffResponse) {
                            return [2, new GenericResponse(ResponseStatus.Failed)];
                        }
                        console.debug(useServerBuffResponse);
                        if (useServerBuffResponse.switch_play_server) {
                            return [2, new GenericResponse(ResponseStatus.SwitchServer, useServerBuffResponse.switch_play_server)];
                        }
                        if (useServerBuffResponse.failure_reason == "Outdated instance id") {
                            return [2, new GenericResponse(ResponseStatus.OutdatedInstanceId)];
                        }
                        if (useServerBuffResponse.success && useServerBuffResponse.okay) {
                            return [2, new UseBlacksmithResponse(useServerBuffResponse.actions)];
                        }
                        _a.label = 3;
                    case 3: return [2, new GenericResponse(ResponseStatus.Failed)];
                }
            });
        });
    };
    IdleChampionsApi.tryToJson = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, response.json()];
                    case 1: return [2, _a.sent()];
                    case 2:
                        e_1 = _a.sent();
                        console.error(e_1);
                        return [2, null];
                    case 3: return [2];
                }
            });
        });
    };
    IdleChampionsApi.isGenericResponse = function (response) {
        return response instanceof GenericResponse;
    };
    IdleChampionsApi.CLIENT_VERSION = "999";
    IdleChampionsApi.NETWORK_ID = "21";
    IdleChampionsApi.LANGUAGE_ID = "1";
    IdleChampionsApi.MAX_BUY_CHESTS = 250;
    IdleChampionsApi.MAX_OPEN_CHESTS = 1000;
    IdleChampionsApi.MAX_BLACKSMITH = 50;
    return IdleChampionsApi;
}());
var REQUEST_DELAY = 2000;
var _waitingForPagePort = false;
var _optionsPort;
chrome.runtime.onConnect.addListener(function (port) {
    if (port.name == "page") {
        if (_waitingForPagePort) {
            console.log("New port opened.");
            _waitingForPagePort = false;
            port.onMessage.addListener(onPagePortMessage);
        }
        else {
            console.log("Unexpected port, disconnecting.");
            port.disconnect();
        }
    }
    else if (port.name == "options") {
        _optionsPort === null || _optionsPort === void 0 ? void 0 : _optionsPort.disconnect();
        port.onMessage.addListener(onOptionsPortMessage);
        _optionsPort = port;
    }
});
chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        contexts: ["action"],
        title: "Open chest management",
        id: "ChestManagement"
    });
});
chrome.contextMenus.onClicked.addListener(onOpenExtensionPageClick);
function onOpenExtensionPageClick(info, tab) {
    if ((info === null || info === void 0 ? void 0 : info.menuItemId) == "ChestManagement") {
        chrome.tabs.create({ url: "dst/chestManagement.html" });
    }
}
function onPagePortMessage(message, port) {
    switch (message.messageType) {
        case "pageReady":
            console.log("Page ready message");
            port.postMessage({ messageType: "scanCodes" });
            break;
        case "codes":
            console.log("Code message received");
            chrome.storage.sync.get([Globals.SETTING_CODES, Globals.SETTING_PENDING], function (_a) {
                var redeemedCodes = _a.redeemedCodes, pendingCodes = _a.pendingCodes;
                handleDetectedCodes(redeemedCodes, pendingCodes, message.codes);
            });
            port.postMessage({ messageType: "closeTab" });
            port.disconnect();
            break;
    }
}
function onOptionsPortMessage(message, port) {
    if (message.messageType == "pageReady") {
        port.postMessage({ messageType: "info", messageText: "Opening discord tab to scan for codes." });
        console.log("Starting scan/upolad process. Opening discord tab.");
        _waitingForPagePort = true;
        chrome.tabs.create({ url: Globals.discordChannelUrl });
        port.postMessage({ messageType: "activateTab" });
    }
}
chrome.action.onClicked.addListener(browserActionClicked);
function browserActionClicked(tab) {
    chrome.tabs.create({ url: "dst/options.html" });
}
function handleDetectedCodes(redeemedCodes, pendingCodes, detectedCodes) {
    var _a;
    if (!detectedCodes || detectedCodes.length == 0)
        return;
    if (!redeemedCodes)
        redeemedCodes = [];
    if (!pendingCodes)
        pendingCodes = [];
    var detectedCode;
    while (detectedCode = detectedCodes.pop()) {
        if (!redeemedCodes.includes(detectedCode) && !pendingCodes.includes(detectedCode)) {
            console.log("New code detected: ".concat(detectedCode));
            pendingCodes.push(detectedCode);
        }
        else if (pendingCodes.includes(detectedCode)) {
            console.debug("Duplicate pending code: ".concat(detectedCode));
        }
        else {
            console.debug("Duplicate redeemed code: ".concat(detectedCode));
        }
    }
    if (pendingCodes.length > 0) {
        console.log("New codes detected, saving list.");
        console.debug(pendingCodes);
        chrome.storage.sync.set((_a = {}, _a[Globals.SETTING_CODES] = redeemedCodes, _a[Globals.SETTING_PENDING] = pendingCodes, _a), function () {
            startUploadProcess();
        });
    }
    else {
        console.log("No new codes detected.");
        _optionsPort.postMessage({ messageType: "info", messageText: "No new codes detected." });
    }
}
function startUploadProcess() {
    chrome.storage.sync.get([Globals.SETTING_CODES, Globals.SETTING_PENDING, Globals.SETTING_INSTANCE_ID, Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], function (_a) {
        var redeemedCodes = _a.redeemedCodes, pendingCodes = _a.pendingCodes, instanceId = _a.instanceId, userId = _a.userId, userHash = _a.userHash;
        console.log("Beginning upload.");
        uploadCodes(redeemedCodes, pendingCodes, instanceId, userId, userHash);
    });
}
function uploadCodes(reedemedCodes, pendingCodes, instanceId, userId, hash) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var server, duplicates, newCodes, expired, invalid, cannotRedeem, chests, heroUnlocks, skinUnlocks, code, codeResponse, userData;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!userId || userId.length == 0 || !hash || hash.length == 0) {
                        _optionsPort.postMessage({ messageType: "missingCredentials" });
                        console.error("No credentials entered.");
                        return [2];
                    }
                    return [4, IdleChampionsApi.getServer()];
                case 1:
                    server = _d.sent();
                    if (!server) {
                        console.error("Failed to get idle champions server.");
                        _optionsPort.postMessage({ messageType: "error", messageText: "Unable to connect to Idle Champions server." });
                        return [2];
                    }
                    console.log("Got server ".concat(server));
                    _optionsPort.postMessage({ messageType: "info", messageText: "Upload starting, ".concat(pendingCodes.length, " new codes to redeem. This may take a bit.") });
                    duplicates = 0, newCodes = 0, expired = 0, invalid = 0, cannotRedeem = 0;
                    chests = {};
                    heroUnlocks = 0, skinUnlocks = 0;
                    _d.label = 2;
                case 2:
                    if (!(code = pendingCodes.pop())) return [3, 12];
                    return [4, new Promise(function (h) { return setTimeout(h, REQUEST_DELAY); })];
                case 3:
                    _d.sent();
                    console.log("Attempting to upload code: ".concat(code));
                    return [4, IdleChampionsApi.submitCode({
                            server: server,
                            user_id: userId,
                            hash: hash,
                            instanceId: instanceId,
                            code: code
                        })];
                case 4:
                    codeResponse = _d.sent();
                    if (!(IdleChampionsApi.isGenericResponse(codeResponse) && codeResponse.status == ResponseStatus.SwitchServer && codeResponse.newServer)) return [3, 6];
                    console.log("Switching server");
                    server = codeResponse.newServer;
                    return [4, IdleChampionsApi.submitCode({
                            server: server,
                            user_id: userId,
                            hash: hash,
                            instanceId: instanceId,
                            code: code
                        })];
                case 5:
                    codeResponse = _d.sent();
                    _d.label = 6;
                case 6:
                    if (!(IdleChampionsApi.isGenericResponse(codeResponse) && codeResponse.status == ResponseStatus.OutdatedInstanceId)) return [3, 11];
                    console.log("Instance ID outdated, refreshing.");
                    return [4, new Promise(function (h) { return setTimeout(h, REQUEST_DELAY); })];
                case 7:
                    _d.sent();
                    return [4, IdleChampionsApi.getUserDetails({
                            server: server,
                            user_id: userId,
                            hash: hash
                        })];
                case 8:
                    userData = _d.sent();
                    if (IdleChampionsApi.isGenericResponse(userData)) {
                        console.log("Failed to retreive user data.");
                        _optionsPort.postMessage({ messageType: "error", messageText: "Failed to retreieve user data, check user ID and hash." });
                        return [2];
                    }
                    else {
                        instanceId = userData.details.instance_id;
                    }
                    chrome.storage.sync.set((_b = {}, _b[Globals.SETTING_INSTANCE_ID] = instanceId, _b));
                    return [4, new Promise(function (h) { return setTimeout(h, REQUEST_DELAY); })];
                case 9:
                    _d.sent();
                    return [4, IdleChampionsApi.submitCode({
                            server: server,
                            user_id: userId,
                            hash: hash,
                            instanceId: instanceId,
                            code: code
                        })];
                case 10:
                    codeResponse = _d.sent();
                    _d.label = 11;
                case 11:
                    if (IdleChampionsApi.isGenericResponse(codeResponse)) {
                        console.error("Unable to submit code, aborting upload process.");
                        _optionsPort.postMessage({ messageType: "error", messageText: "Failed to submit code for unknown reason." });
                        return [2];
                    }
                    else {
                        switch (codeResponse.codeStatus) {
                            case CodeSubmitStatus.InvalidParameters:
                                console.error("Unable to submit code due to invalid parameters.");
                                _optionsPort.postMessage({ messageType: "error", messageText: "Failed to submit code, check user/hash on settings tab." });
                                return [2];
                            case CodeSubmitStatus.Expired:
                            case CodeSubmitStatus.NotValidCombo:
                            case CodeSubmitStatus.AlreadyRedeemed:
                            case CodeSubmitStatus.Success:
                            case CodeSubmitStatus.CannotRedeem:
                                if (codeResponse.codeStatus == CodeSubmitStatus.AlreadyRedeemed) {
                                    console.log("Already redeemed code: ".concat(code));
                                    duplicates++;
                                }
                                else if (codeResponse.codeStatus == CodeSubmitStatus.NotValidCombo) {
                                    console.log("Invalid code: ".concat(code));
                                    invalid++;
                                }
                                else if (codeResponse.codeStatus == CodeSubmitStatus.Expired) {
                                    console.log("Expired code: ".concat(code));
                                    expired++;
                                }
                                if (codeResponse.codeStatus == CodeSubmitStatus.CannotRedeem) {
                                    console.log("Cannot redeem: ".concat(code));
                                    cannotRedeem++;
                                }
                                else {
                                    console.log("Sucessfully redeemed: ".concat(code));
                                    (_a = codeResponse.lootDetail) === null || _a === void 0 ? void 0 : _a.forEach(function (loot) {
                                        var _a;
                                        switch (loot.loot_action) {
                                            case "generic_chest":
                                                if (loot.chest_type_id && loot.count) {
                                                    chests[loot.chest_type_id] = ((_a = chests[loot.chest_type_id]) !== null && _a !== void 0 ? _a : 0) + loot.count;
                                                }
                                                break;
                                            case "unlock_hero":
                                                heroUnlocks++;
                                                break;
                                            case "claim":
                                                if (loot.unlock_hero_skin) {
                                                    skinUnlocks++;
                                                }
                                                break;
                                        }
                                    });
                                    newCodes++;
                                }
                                reedemedCodes.push(code);
                                if (reedemedCodes.length > 300) {
                                    reedemedCodes.shift();
                                }
                                chrome.storage.sync.set((_c = {}, _c[Globals.SETTING_CODES] = reedemedCodes, _c[Globals.SETTING_PENDING] = pendingCodes, _c));
                                break;
                        }
                    }
                    _optionsPort.postMessage({ messageType: "info", messageText: "Uploading... ".concat(pendingCodes.length, " codes left. This may take a bit.") });
                    return [3, 2];
                case 12:
                    console.log("Redeem complete:");
                    console.log("".concat(duplicates, " duplicate codes"));
                    console.log("".concat(newCodes, " new redemptions"));
                    console.log("".concat(expired, " expired"));
                    console.log("".concat(invalid, " invalid"));
                    console.log("".concat(cannotRedeem, " unable to be redeemed"));
                    console.log(chests);
                    _optionsPort.postMessage({
                        messageType: "success",
                        chests: chests,
                        heroUnlocks: heroUnlocks,
                        skinUnlocks: skinUnlocks,
                        messageText: "Upload completed successfully:<br>\n                        ".concat(duplicates > 0 ? "".concat(duplicates, " codes already redeemed<br>") : "", "\n                        ").concat(expired > 0 ? "".concat(expired, " expired codes<br>") : "", "\n                        ").concat(invalid > 0 ? "".concat(invalid, " invalid codes<br>") : "", "\n                        ").concat(cannotRedeem > 0 ? "".concat(cannotRedeem, " unable to be redeemed<br>") : "", "\n                        ").concat(newCodes, " codes redeemed")
                    });
                    return [2];
            }
        });
    });
}
