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
var CodeSubmitStatus;
(function (CodeSubmitStatus) {
    CodeSubmitStatus[CodeSubmitStatus["Success"] = 0] = "Success";
    CodeSubmitStatus[CodeSubmitStatus["OutdatedInstanceId"] = 1] = "OutdatedInstanceId";
    CodeSubmitStatus[CodeSubmitStatus["AlreadyRedeemed"] = 2] = "AlreadyRedeemed";
    CodeSubmitStatus[CodeSubmitStatus["Failed"] = 3] = "Failed";
})(CodeSubmitStatus || (CodeSubmitStatus = {}));
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
                        return [4, response.json()];
                    case 2:
                        serverDefs = _a.sent();
                        return [2, serverDefs.play_server + "post.php"];
                    case 3: return [2, null];
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
                        return [4, response.json()];
                    case 2:
                        redeemResponse = _a.sent();
                        if (redeemResponse.success && redeemResponse.failure_reason === "you_already_redeemed_combination") {
                            return [2, CodeSubmitStatus.AlreadyRedeemed];
                        }
                        if (redeemResponse.success) {
                            return [2, CodeSubmitStatus.Success];
                        }
                        if (!redeemResponse.success && redeemResponse.failure_reason === "Outdated instance id") {
                            return [2, CodeSubmitStatus.OutdatedInstanceId];
                        }
                        console.error("Unknown failure reason");
                        console.debug(redeemResponse);
                        return [2, CodeSubmitStatus.Failed];
                    case 3: return [2, CodeSubmitStatus.Failed];
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
                        return [4, response.json()];
                    case 2:
                        playerData = _a.sent();
                        if (playerData.success) {
                            return [2, playerData];
                        }
                        _a.label = 3;
                    case 3: return [2, null];
                }
            });
        });
    };
    IdleChampionsApi.MAX_CODES_QUOTA = 200;
    IdleChampionsApi.CLIENT_VERSION = "999";
    IdleChampionsApi.NETWORK_ID = "21";
    IdleChampionsApi.LANGUAGE_ID = "1";
    return IdleChampionsApi;
}());
chrome.action.setIcon({ "path": "media/icon-enabled.png" }, function () { });
chrome.runtime.onMessage.addListener(onMessage);
function onMessage(message, sender, sendResponse) {
    if (message.messageType == "codes") {
        console.log("Code message received");
        chrome.storage.sync.get([Globals.SETTING_CODES, Globals.SETTING_PENDING], function (_a) {
            var redeemedCodes = _a.redeemedCodes, pendingCodes = _a.pendingCodes;
            handleDetectedCodes(redeemedCodes, pendingCodes, message.codes);
        });
    }
}
function handleDetectedCodes(redeemedCodes, pendingCodes, detectedCodes) {
    var _a;
    if (!detectedCodes || detectedCodes.length == 0)
        return;
    if (!redeemedCodes)
        redeemedCodes = [];
    if (!pendingCodes)
        pendingCodes = [];
    while (detectedCodes.length > 0) {
        var detectedCode = detectedCodes.pop();
        if (!redeemedCodes.includes(detectedCode) && !pendingCodes.includes(detectedCode)) {
            console.log("New code detected: " + detectedCode);
            pendingCodes.push(detectedCode);
        }
        else if (pendingCodes.includes(detectedCode)) {
            console.debug("Duplicate pending code: " + detectedCode);
        }
        else {
            console.debug("Duplicate redeemed code: " + detectedCode);
        }
    }
    if (pendingCodes.length > 0) {
        console.log("New codes detected, saving list.");
        console.debug(pendingCodes);
        chrome.storage.sync.set((_a = {}, _a[Globals.SETTING_CODES] = redeemedCodes, _a[Globals.SETTING_PENDING] = pendingCodes, _a), function () {
            startUploadProcess();
        });
    }
}
var uploadRunning = false;
function startUploadProcess() {
    var _this = this;
    chrome.storage.sync.get([Globals.SETTING_CODES, Globals.SETTING_PENDING, Globals.SETTING_INSTANCE_ID, Globals.SETTING_USER_ID, Globals.SETTING_USER_HASH], function (_a) {
        var redeemedCodes = _a.redeemedCodes, pendingCodes = _a.pendingCodes, instanceId = _a.instanceId, userId = _a.userId, userHash = _a.userHash;
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (uploadRunning)
                            return [2];
                        uploadRunning = true;
                        console.log("Beginning upload.");
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, , 3, 4]);
                        return [4, uploadCodes(redeemedCodes, pendingCodes, instanceId, userId, userHash)];
                    case 2:
                        _b.sent();
                        return [3, 4];
                    case 3:
                        uploadRunning = false;
                        return [7];
                    case 4: return [2];
                }
            });
        });
    });
}
function uploadCodes(reedemedCodes, pendingCodes, instanceId, userId, hash) {
    return __awaiter(this, void 0, void 0, function () {
        var server, duplicates, newCodes, code, codeResponse, userData;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!userId || userId.length == 0 || !hash || hash.length == 0) {
                        chrome.runtime.sendMessage({ messageType: "missingCredentials" });
                        console.error("No credentials entered.");
                        return [2];
                    }
                    return [4, IdleChampionsApi.getServer()];
                case 1:
                    server = _c.sent();
                    if (!server) {
                        console.error("Failed to get idle champions server.");
                        chrome.runtime.sendMessage({ messageType: "error", messageText: "Unable to connect to Idle Champions server." });
                        return [2];
                    }
                    console.log("Got server " + server);
                    return [4, new Promise(function (h) { return setTimeout(h, 3000); })];
                case 2:
                    _c.sent();
                    chrome.runtime.sendMessage({ messageType: "info", messageText: "Upload starting, " + pendingCodes.length + " new codes to redeem. This may take a bit." });
                    duplicates = 0;
                    newCodes = 0;
                    _c.label = 3;
                case 3:
                    if (!(pendingCodes.length > 0)) return [3, 11];
                    code = pendingCodes.pop();
                    console.log("Attempting to upload code: " + code);
                    return [4, IdleChampionsApi.submitCode({
                            server: server,
                            user_id: userId,
                            hash: hash,
                            instanceId: instanceId,
                            code: code
                        })];
                case 4:
                    codeResponse = _c.sent();
                    if (!(codeResponse == CodeSubmitStatus.OutdatedInstanceId)) return [3, 9];
                    console.log("Instance ID outdated, refreshing.");
                    return [4, new Promise(function (h) { return setTimeout(h, 3000); })];
                case 5:
                    _c.sent();
                    return [4, IdleChampionsApi.getUserDetails({
                            server: server,
                            user_id: userId,
                            hash: hash
                        })];
                case 6:
                    userData = _c.sent();
                    if (!userData) {
                        console.log("Failed to retreive user data.");
                        chrome.runtime.sendMessage({ messageType: "error", messageText: "Failed to retreieve user data, check user ID and hash." });
                        return [2];
                    }
                    instanceId = userData.details.instance_id;
                    chrome.storage.sync.set((_a = {}, _a[Globals.SETTING_INSTANCE_ID] = instanceId, _a));
                    return [4, new Promise(function (h) { return setTimeout(h, 3000); })];
                case 7:
                    _c.sent();
                    return [4, IdleChampionsApi.submitCode({
                            server: server,
                            user_id: userId,
                            hash: hash,
                            instanceId: instanceId,
                            code: code
                        })];
                case 8:
                    codeResponse = _c.sent();
                    _c.label = 9;
                case 9:
                    switch (codeResponse) {
                        case CodeSubmitStatus.OutdatedInstanceId:
                        case CodeSubmitStatus.Failed:
                            console.error("Unable to submit code, aborting upload process.");
                            chrome.runtime.sendMessage({ messageType: "error", messageText: "Failed to submit code for unknown reason." });
                            return [2];
                        case CodeSubmitStatus.AlreadyRedeemed:
                        case CodeSubmitStatus.Success:
                            if (codeResponse == CodeSubmitStatus.AlreadyRedeemed) {
                                console.log("Already redeemed code: " + code);
                                duplicates++;
                            }
                            else {
                                console.log("Sucessfully redeemed: " + code);
                                newCodes++;
                            }
                            reedemedCodes.push(code);
                            chrome.storage.sync.set((_b = {}, _b[Globals.SETTING_CODES] = reedemedCodes, _b[Globals.SETTING_PENDING] = pendingCodes, _b));
                            break;
                    }
                    return [4, new Promise(function (h) { return setTimeout(h, 10000); })];
                case 10:
                    _c.sent();
                    chrome.runtime.sendMessage({ messageType: "info", messageText: "Uploading... " + pendingCodes.length + " codes left. This may take a bit." });
                    return [3, 3];
                case 11:
                    console.log("Redeem complete:");
                    console.log(duplicates + " duplicate codes");
                    console.log(newCodes + " new redemptions");
                    chrome.runtime.sendMessage({ messageType: "success", messageText: "Upload completed successfully.\n" + (duplicates > 0 ? duplicates + " codes already redeemed" : "") + "\n" + newCodes + " redeemed." });
                    return [2];
            }
        });
    });
}
