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
document.addEventListener("DOMContentLoaded", loaded);
var REQUEST_DELAY = 2000;
var _buyCountRange, _buyCountNumber;
var _openCountRange, _openCountNumber;
var _blacksmithCountRange, _blacksmithCountNumber;
var _server;
var _instanceId;
var _userData;
var _shownCloseClientWarning = false;
var _blacksmithAggregate;
function loaded() {
    var _a, _b, _c, _d;
    document.getElementById("refreshInventory").addEventListener('click', refreshClick);
    document.getElementById("purchaseButton").addEventListener('click', purchaseClick);
    document.getElementById("openButton").addEventListener('click', openClick);
    document.getElementById("blacksmithButton").addEventListener('click', blacksmithClick);
    (_a = document.getElementById("buyChestType")) === null || _a === void 0 ? void 0 : _a.addEventListener('change', setMaximumValues);
    (_b = document.getElementById("openChestType")) === null || _b === void 0 ? void 0 : _b.addEventListener('change', setMaximumValues);
    (_c = document.getElementById("blackithContracType")) === null || _c === void 0 ? void 0 : _c.addEventListener('change', setMaximumValues);
    (_d = document.getElementById("heroId")) === null || _d === void 0 ? void 0 : _d.addEventListener('change', updateSelectedHero);
    _buyCountRange = document.getElementById("buyCountRange");
    _buyCountNumber = document.getElementById("buyCountNumber");
    _buyCountRange.oninput = buyRangeChanged;
    _buyCountNumber.oninput = buyNumberChanged;
    _openCountRange = document.getElementById("openCountRange");
    _openCountNumber = document.getElementById("openCountNumber");
    _openCountRange.oninput = openRangeChanged;
    _openCountNumber.oninput = openNumberChanged;
    _blacksmithCountRange = document.getElementById("blacksmithCountRange");
    _blacksmithCountNumber = document.getElementById("blacksmithCountNumber");
    _blacksmithCountRange.oninput = blacksmithRangeChanged;
    _blacksmithCountNumber.oninput = blacksmithNumberChanged;
}
function buyRangeChanged() {
    _buyCountNumber.value = _buyCountRange.value;
}
function buyNumberChanged() {
    if (parseInt(_buyCountNumber.value) > parseInt(_buyCountNumber.max)) {
        _buyCountNumber.value = _buyCountNumber.max;
    }
    _buyCountRange.value = _buyCountNumber.value;
}
function openRangeChanged() {
    _openCountNumber.value = _openCountRange.value;
}
function openNumberChanged() {
    if (parseInt(_openCountNumber.value) > parseInt(_openCountNumber.max)) {
        _openCountNumber.value = _openCountNumber.max;
    }
    _openCountRange.value = _openCountNumber.value;
}
function blacksmithRangeChanged() {
    _blacksmithCountNumber.value = _blacksmithCountRange.value;
}
function blacksmithNumberChanged() {
    if (parseInt(_blacksmithCountNumber.value) > parseInt(_blacksmithCountNumber.max)) {
        _blacksmithCountNumber.value = _blacksmithCountNumber.max;
    }
    _blacksmithCountRange.value = _blacksmithCountNumber.value;
}
function refreshClick() {
    hideMessages();
    chrome.storage.sync.get([Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], function (_a) {
        var userId = _a.userId, userHash = _a.userHash;
        refreshInventory(userId, userHash);
    });
}
function refreshInventory(userId, hash) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var userDetailsResponse;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!userId || userId.length == 0 || !hash || hash.length == 0) {
                        showError("No credentials entered.");
                        return [2];
                    }
                    if (!!_server) return [3, 2];
                    return [4, IdleChampionsApi.getServer()];
                case 1:
                    _server = _e.sent();
                    console.log("Got server ".concat(_server));
                    _e.label = 2;
                case 2:
                    if (!_server) {
                        showError("Failed to get idle champions server.");
                        return [2];
                    }
                    return [4, IdleChampionsApi.getUserDetails({
                            server: _server,
                            user_id: userId,
                            hash: hash
                        })];
                case 3:
                    userDetailsResponse = _e.sent();
                    if (!IdleChampionsApi.isGenericResponse(userDetailsResponse)) return [3, 5];
                    if (userDetailsResponse.status == ResponseStatus.Failed) {
                        showError("Failed to retreive user data.");
                        return [2];
                    }
                    if (!(userDetailsResponse.status == ResponseStatus.SwitchServer && userDetailsResponse.newServer)) return [3, 5];
                    console.log("Got switch server to '".concat(userDetailsResponse.newServer, "'."));
                    _server = userDetailsResponse.newServer;
                    return [4, IdleChampionsApi.getUserDetails({
                            server: _server,
                            user_id: userId,
                            hash: hash
                        })];
                case 4:
                    userDetailsResponse = _e.sent();
                    if (IdleChampionsApi.isGenericResponse(userDetailsResponse)) {
                        showError("Failed to retreive user data.");
                        return [2];
                    }
                    _e.label = 5;
                case 5:
                    _userData = userDetailsResponse;
                    console.log("Refreshed inventory data.");
                    console.debug(_userData);
                    _instanceId = _userData.details.instance_id;
                    chrome.storage.sync.set((_d = {}, _d[Globals.SETTING_INSTANCE_ID] = _userData.details.instance_id, _d));
                    document.getElementById("gemCount").textContent = _userData.details.red_rubies.toLocaleString();
                    document.getElementById("silverChestCount").textContent = ((_a = _userData.details.chests[1]) === null || _a === void 0 ? void 0 : _a.toLocaleString()) || "0";
                    document.getElementById("goldChestCount").textContent = ((_b = _userData.details.chests[2]) === null || _b === void 0 ? void 0 : _b.toLocaleString()) || "0";
                    document.getElementById("electrumChestCount").textContent = ((_c = _userData.details.chests[282]) === null || _c === void 0 ? void 0 : _c.toLocaleString()) || "0";
                    document.getElementById("whiteBlacksmithCount").textContent = findBuffCount(31..toString()).toLocaleString() || "0";
                    document.getElementById("greenBlacksmithCount").textContent = findBuffCount(32..toString()).toLocaleString() || "0";
                    document.getElementById("blueBlacksmithCount").textContent = findBuffCount(33..toString()).toLocaleString() || "0";
                    document.getElementById("purpleBlacksmithCount").textContent = findBuffCount(34..toString()).toLocaleString() || "0";
                    setMaximumValues();
                    updateSelectedHero();
                    document.getElementById("actionTabs").classList.add("show");
                    return [2];
            }
        });
    });
}
function findBuffCount(buff_id) {
    var _a, _b, _c;
    var countString = (_c = (_b = (_a = _userData === null || _userData === void 0 ? void 0 : _userData.details) === null || _a === void 0 ? void 0 : _a.buffs) === null || _b === void 0 ? void 0 : _b.find(function (b) { return b.buff_id == buff_id.toString(); })) === null || _c === void 0 ? void 0 : _c.inventory_amount;
    return parseInt(countString !== null && countString !== void 0 ? countString : "0");
}
function setMaximumValues() {
    var _a;
    if (!_userData)
        return;
    var gems = _userData.details.red_rubies;
    var buyMax = 0;
    switch (document.getElementById("buyChestType").value) {
        case 1..toString():
            buyMax = Math.trunc(gems / 50);
            break;
        case 2..toString():
            buyMax = Math.trunc(gems / 500);
            break;
    }
    document.getElementById("buyCountRange").max = buyMax.toString();
    document.getElementById("buyCountRange").value = buyMax.toString();
    document.getElementById("buyCountNumber").max = buyMax.toString();
    document.getElementById("buyCountNumber").value = buyMax.toString();
    var chestType = document.getElementById("openChestType").value;
    var openMax = (_a = _userData.details.chests[chestType]) !== null && _a !== void 0 ? _a : 0;
    document.getElementById("openCountRange").max = openMax.toString();
    document.getElementById("openCountRange").value = openMax.toString();
    document.getElementById("openCountNumber").max = openMax.toString();
    document.getElementById("openCountNumber").value = openMax.toString();
    var contractType = document.getElementById("blackithContracType").value;
    var blacksmithMax = findBuffCount(contractType);
    document.getElementById("blacksmithCountRange").max = blacksmithMax.toString();
    document.getElementById("blacksmithCountRange").value = blacksmithMax.toString();
    document.getElementById("blacksmithCountNumber").max = blacksmithMax.toString();
    document.getElementById("blacksmithCountNumber").value = blacksmithMax.toString();
}
function updateSelectedHero() {
    var heroId = document.getElementById("heroId").value;
    if ((_blacksmithAggregate === null || _blacksmithAggregate === void 0 ? void 0 : _blacksmithAggregate.heroId) != heroId) {
        _blacksmithAggregate = new BlacksmithAggregateResult(heroId, _userData);
    }
    else {
        _blacksmithAggregate.UpdateLevels(_userData);
    }
    displayBlacksmithResults();
}
function purchaseClick() {
    hideMessages();
    chrome.storage.sync.get([Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], function (_a) {
        var userId = _a.userId, userHash = _a.userHash;
        purchaseChests(userId, userHash);
    });
}
function purchaseChests(userId, hash) {
    return __awaiter(this, void 0, void 0, function () {
        var chestType, chestAmount, remainingChests, currentAmount, responseStatus;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!_server)
                        return [2];
                    chestType = document.getElementById("buyChestType").value;
                    chestAmount = parseInt(document.getElementById("buyCountRange").value) || 0;
                    if (!chestType || chestAmount < 1) {
                        return [2];
                    }
                    remainingChests = chestAmount;
                    _a.label = 1;
                case 1:
                    if (!(remainingChests > 0)) return [3, 5];
                    showInfo("Purchasing... ".concat(remainingChests, " chests remaining to purchase"));
                    currentAmount = Math.min(remainingChests, IdleChampionsApi.MAX_BUY_CHESTS);
                    remainingChests -= currentAmount;
                    console.log("Purchasing ".concat(currentAmount, " chests"));
                    return [4, IdleChampionsApi.purchaseChests({
                            server: _server,
                            user_id: userId,
                            hash: hash,
                            chestTypeId: chestType,
                            count: currentAmount
                        })];
                case 2:
                    responseStatus = _a.sent();
                    if (responseStatus.status == ResponseStatus.SwitchServer && responseStatus.newServer) {
                        _server = responseStatus.newServer;
                        remainingChests += currentAmount;
                        console.log("Switching server");
                    }
                    if (responseStatus.status == ResponseStatus.InsuficcientCurrency) {
                        showError("Insufficient gems remaining");
                        return [2];
                    }
                    else if (responseStatus.status == ResponseStatus.Failed) {
                        showError("Purchase failed");
                        return [2];
                    }
                    if (!(remainingChests > 0)) return [3, 4];
                    return [4, new Promise(function (h) { return setTimeout(h, REQUEST_DELAY); })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [3, 1];
                case 5:
                    console.log("Completed purchase");
                    return [4, refreshInventory(userId, hash)];
                case 6:
                    _a.sent();
                    showSuccess("Purchased ".concat(chestAmount, " chests"));
                    return [2];
            }
        });
    });
}
function openClick() {
    hideMessages();
    chrome.storage.sync.get([Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], function (_a) {
        var userId = _a.userId, userHash = _a.userHash;
        openChests(userId, userHash);
    });
}
function blacksmithClick() {
    hideMessages();
    chrome.storage.sync.get([Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], function (_a) {
        var userId = _a.userId, userHash = _a.userHash;
        useBlacksmithContracts(userId, userHash);
    });
}
function openChests(userId, hash) {
    return __awaiter(this, void 0, void 0, function () {
        var lootResults, chestType, chestAmount, remainingChests, currentAmount, openResponse, lastInstanceId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!_server || !_instanceId)
                        return [2];
                    if (!_shownCloseClientWarning) {
                        showOpenWarning("You MUST close the client before calling open chests. Click open again to confirm.");
                        _shownCloseClientWarning = true;
                        return [2];
                    }
                    _shownCloseClientWarning = false;
                    lootResults = new LootAggregateResult();
                    chestType = document.getElementById("openChestType").value;
                    chestAmount = parseInt(document.getElementById("openCountRange").value) || 0;
                    if (!chestType || chestAmount < 1) {
                        return [2];
                    }
                    remainingChests = chestAmount;
                    _a.label = 1;
                case 1:
                    if (!(remainingChests > 0)) return [3, 10];
                    showInfo("Opening... ".concat(remainingChests, " chests remaining to open"));
                    currentAmount = Math.min(remainingChests, IdleChampionsApi.MAX_OPEN_CHESTS);
                    remainingChests -= currentAmount;
                    console.log("Opening ".concat(currentAmount, " chests"));
                    return [4, IdleChampionsApi.openChests({
                            server: _server,
                            user_id: userId,
                            hash: hash,
                            chestTypeId: chestType,
                            count: currentAmount,
                            instanceId: _instanceId
                        })];
                case 2:
                    openResponse = _a.sent();
                    if (!IdleChampionsApi.isGenericResponse(openResponse)) return [3, 6];
                    if (openResponse.status == ResponseStatus.SwitchServer && openResponse.newServer) {
                        _server = openResponse.newServer;
                        remainingChests += currentAmount;
                        console.log("Switching server");
                    }
                    if (!(openResponse.status == ResponseStatus.OutdatedInstanceId)) return [3, 4];
                    lastInstanceId = _instanceId;
                    console.log("Refreshing inventory for instance ID");
                    return [4, refreshInventory(userId, hash)];
                case 3:
                    _a.sent();
                    if (_instanceId == lastInstanceId) {
                        showError("Failed to get updated instance ID. Check credentials.");
                        return [2];
                    }
                    remainingChests += currentAmount;
                    return [3, 5];
                case 4:
                    if (openResponse.status == ResponseStatus.Failed) {
                        showError("Purchase failed");
                        return [2];
                    }
                    _a.label = 5;
                case 5: return [3, 7];
                case 6:
                    aggregateOpenResults(openResponse.lootDetail, lootResults);
                    _a.label = 7;
                case 7:
                    displayLootResults(lootResults);
                    if (!(remainingChests > 0)) return [3, 9];
                    return [4, new Promise(function (h) { return setTimeout(h, REQUEST_DELAY); })];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: return [3, 1];
                case 10:
                    console.log("Completed opening");
                    return [4, refreshInventory(userId, hash)];
                case 11:
                    _a.sent();
                    showSuccess("Opened ".concat(chestAmount, " chests"));
                    return [2];
            }
        });
    });
}
function hideMessages() {
    document.getElementById("error").classList.remove("show");
    document.getElementById("openWarning").classList.remove("show");
    document.getElementById("success").classList.remove("show");
    document.getElementById("info").classList.remove("show");
}
function showError(text) {
    console.error(text);
    hideMessages();
    document.getElementById("error").classList.add("show");
    document.querySelector("#error span").innerHTML = text;
}
function showOpenWarning(text) {
    hideMessages();
    document.getElementById("openWarning").classList.add("show");
    document.querySelector("#openWarning span").innerHTML = text;
}
function showInfo(text) {
    hideMessages();
    document.getElementById("info").classList.add("show");
    document.querySelector("#info span").innerHTML = text;
}
function showSuccess(text) {
    hideMessages();
    document.getElementById("success").classList.add("show");
    document.querySelector("#success span").innerHTML = text;
}
var LootAggregateResult = (function () {
    function LootAggregateResult() {
        this.gems = 0;
        this.shinies = 0;
        this.commonBounties = 0;
        this.uncommonBounties = 0;
        this.rareBounties = 0;
        this.epicBounties = 0;
        this.commonBlacksmith = 0;
        this.uncommonBlacksmith = 0;
        this.rareBlacksmith = 0;
        this.epicBlacksmith = 0;
    }
    return LootAggregateResult;
}());
function aggregateOpenResults(loot, aggregateResult) {
    aggregateResult.shinies += loot.filter(function (l) { return l.gilded; }).length;
    aggregateResult.commonBounties += loot.filter(function (l) { return l.add_inventory_buff_id == 17; }).length;
    aggregateResult.uncommonBounties += loot.filter(function (l) { return l.add_inventory_buff_id == 18; }).length;
    aggregateResult.rareBounties += loot.filter(function (l) { return l.add_inventory_buff_id == 19; }).length;
    aggregateResult.epicBounties += loot.filter(function (l) { return l.add_inventory_buff_id == 20; }).length;
    aggregateResult.commonBlacksmith += loot.filter(function (l) { return l.add_inventory_buff_id == 31; }).length;
    aggregateResult.uncommonBlacksmith += loot.filter(function (l) { return l.add_inventory_buff_id == 32; }).length;
    aggregateResult.rareBlacksmith += loot.filter(function (l) { return l.add_inventory_buff_id == 33; }).length;
    aggregateResult.epicBlacksmith += loot.filter(function (l) { return l.add_inventory_buff_id == 34; }).length;
    aggregateResult.gems += loot.reduce(function (count, l) { var _a; return count + ((_a = l.add_soft_currency) !== null && _a !== void 0 ? _a : 0); }, 0);
}
function displayLootResults(aggregateResult) {
    document.querySelector("#chestLoot tbody").innerHTML = "";
    addTableRow("Shinies", aggregateResult.shinies);
    addTableRow("Gems", aggregateResult.gems);
    addTableRow("Tiny Bounty Contract", aggregateResult.commonBounties, "rarity-common");
    addTableRow("Small Bounty Contract", aggregateResult.uncommonBounties, "rarity-uncommon");
    addTableRow("Medium Bounty Contract", aggregateResult.rareBounties, "rarity-rare");
    addTableRow("Large Bounty Contract", aggregateResult.epicBounties, "rarity-epic");
    addTableRow("Tiny Blacksmithing Contract", aggregateResult.commonBlacksmith, "rarity-common");
    addTableRow("Small Blacksmithing Contract", aggregateResult.uncommonBlacksmith, "rarity-uncommon");
    addTableRow("Medium Blacksmithing Contract", aggregateResult.rareBlacksmith, "rarity-rare");
    addTableRow("Large Blacksmithing Contract", aggregateResult.epicBlacksmith, "rarity-epic");
}
function addTableRow(text, amount, style) {
    if (amount == 0)
        return;
    var tbody = document.querySelector("#chestLoot tbody");
    tbody.append(buildTableRow(text, amount, style));
}
function buildTableRow(label, amount, style) {
    var labelColumn = document.createElement("td");
    labelColumn.innerText = label;
    var amountColumn = document.createElement("td");
    amountColumn.innerText = amount.toString();
    var row = document.createElement("tr");
    if (style) {
        row.classList.add(style);
    }
    row.appendChild(labelColumn);
    row.appendChild(amountColumn);
    return row;
}
var BlacksmithAggregateResult = (function () {
    function BlacksmithAggregateResult(heroId, userData) {
        this.slotResult = new Array(7);
        this.slotEndValue = new Array(7);
        this.heroId = heroId;
        this.UpdateLevels(userData);
    }
    BlacksmithAggregateResult.prototype.UpdateLevels = function (userData) {
        var _this = this;
        var _a, _b;
        (_b = (_a = userData === null || userData === void 0 ? void 0 : userData.details) === null || _a === void 0 ? void 0 : _a.loot) === null || _b === void 0 ? void 0 : _b.filter(function (l) { return l.hero_id == parseInt(_this.heroId); }).forEach(function (lootItem) {
            _this.slotEndValue[lootItem.slot_id] = lootItem.enchant + 1;
        });
    };
    return BlacksmithAggregateResult;
}());
function useBlacksmithContracts(userId, hash) {
    return __awaiter(this, void 0, void 0, function () {
        var contractType, heroId, blacksmithAmount, remainingContracts, currentAmount, blacksmithResponse, lastInstanceId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!_server || !_instanceId)
                        return [2];
                    contractType = document.getElementById("blackithContracType").value;
                    heroId = document.getElementById("heroId").value;
                    blacksmithAmount = parseInt(_blacksmithCountRange.value) || 0;
                    updateSelectedHero();
                    if (!contractType || !heroId || blacksmithAmount < 1) {
                        return [2];
                    }
                    remainingContracts = blacksmithAmount;
                    _a.label = 1;
                case 1:
                    if (!(remainingContracts > 0)) return [3, 10];
                    showInfo("Smithing... ".concat(remainingContracts, " contracts remaining to use"));
                    currentAmount = Math.min(remainingContracts, IdleChampionsApi.MAX_BLACKSMITH);
                    remainingContracts -= currentAmount;
                    console.log("Using ".concat(currentAmount, " contracts"));
                    return [4, IdleChampionsApi.useBlacksmith({
                            server: _server,
                            user_id: userId,
                            hash: hash,
                            heroId: heroId,
                            contractType: contractType,
                            count: currentAmount,
                            instanceId: _instanceId
                        })];
                case 2:
                    blacksmithResponse = _a.sent();
                    if (!IdleChampionsApi.isGenericResponse(blacksmithResponse)) return [3, 6];
                    if (blacksmithResponse.status == ResponseStatus.SwitchServer && blacksmithResponse.newServer) {
                        _server = blacksmithResponse.newServer;
                        remainingContracts += currentAmount;
                        console.log("Switching server");
                    }
                    if (!(blacksmithResponse.status == ResponseStatus.OutdatedInstanceId)) return [3, 4];
                    lastInstanceId = _instanceId;
                    console.log("Refreshing inventory for instance ID");
                    return [4, refreshInventory(userId, hash)];
                case 3:
                    _a.sent();
                    if (_instanceId == lastInstanceId) {
                        showError("Failed to get updated instance ID. Check credentials.");
                        return [2];
                    }
                    remainingContracts += currentAmount;
                    return [3, 5];
                case 4:
                    if (blacksmithResponse.status == ResponseStatus.Failed) {
                        showError("Blacksmithing failed");
                        return [2];
                    }
                    _a.label = 5;
                case 5: return [3, 7];
                case 6:
                    aggregateBlacksmithResults(blacksmithResponse.actions);
                    _a.label = 7;
                case 7:
                    displayBlacksmithResults();
                    if (!(remainingContracts > 0)) return [3, 9];
                    return [4, new Promise(function (h) { return setTimeout(h, REQUEST_DELAY); })];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: return [3, 1];
                case 10:
                    console.log("Completed blacksmithing");
                    return [4, refreshInventory(userId, hash)];
                case 11:
                    _a.sent();
                    showSuccess("Used ".concat(blacksmithAmount, " blacksmith contracts"));
                    return [2];
            }
        });
    });
}
function aggregateBlacksmithResults(blacksmithActions) {
    blacksmithActions.forEach(function (action) {
        var _a;
        if (action.action == "level_up_loot") {
            var newLevels = parseInt(action.amount);
            _blacksmithAggregate.slotResult[action.slot_id] = ((_a = _blacksmithAggregate.slotResult[action.slot_id]) !== null && _a !== void 0 ? _a : 0) + newLevels;
            _blacksmithAggregate.slotEndValue[action.slot_id] = action.enchant_level + 1;
        }
    });
}
function displayBlacksmithResults() {
    document.querySelector("#blacksmithResults tbody").innerHTML = "";
    for (var i = 1; i <= 6; i++) {
        addBlacksmithTableRow("Slot " + i, _blacksmithAggregate.slotResult[i], _blacksmithAggregate.slotEndValue[i]);
    }
}
function addBlacksmithTableRow(text, amount, newLevel, style) {
    var tbody = document.querySelector("#blacksmithResults tbody");
    tbody.append(buildBlacksmithTableRow(text, amount, newLevel, style));
}
function buildBlacksmithTableRow(slotName, addedLevels, newLevel, style) {
    var slotColumn = document.createElement("td");
    slotColumn.innerText = slotName;
    var addedLevelsColumn = document.createElement("td");
    addedLevelsColumn.innerText = (addedLevels === null || addedLevels === void 0 ? void 0 : addedLevels.toString()) || "0";
    var newLevelColumn = document.createElement("td");
    newLevelColumn.innerText = (newLevel === null || newLevel === void 0 ? void 0 : newLevel.toString()) || "0";
    var row = document.createElement("tr");
    if (style) {
        row.classList.add(style);
    }
    row.appendChild(slotColumn);
    row.appendChild(addedLevelsColumn);
    row.appendChild(newLevelColumn);
    return row;
}
