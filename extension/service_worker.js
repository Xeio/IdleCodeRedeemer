/// <reference path="./../lib/chrome.d.ts" />
var Globals = /** @class */ (function () {
    function Globals() {
    }
    Globals.debugMode = !chrome.runtime.getManifest().update_url;
    Globals.discordChannelUrl = "https://discord.com/channels/357247482247380994/358044869685673985";
    return Globals;
}());
/// <reference path="./../lib/chrome.d.ts" />
/// <reference path="./../lib/server_definitions.d.ts" />
/// <reference path="./../shared/globals.ts" />
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
var _timeout = 0;
var CODES_SETTING = "codes";
var UNUPLOADED_SETTING = "unuploaded";
var USERDATA_SETTING = "userdata";
var MAX_CODES_QUOTA = 200;
console.debug("Testing:" + Globals.debugMode);
chrome.action.setIcon({ "path": "media/icon-enabled.png" }, function () { });
chrome.runtime.onMessage.addListener(onMessage);
function onMessage(request, sender, sendResponse) {
    if (request.messageType == "codes") {
        console.log("Code message received");
        clearTimeout(_timeout);
        chrome.storage.sync.get([CODES_SETTING], function (_a) {
            var codes = _a.codes;
            newCodeAlarmUpload(codes, request.codes);
        });
    }
}
function newCodeAlarmUpload(codes, detectedCodes) {
    if (!detectedCodes)
        return;
    if (detectedCodes.length == 0)
        return; //Stop the loop
    if (!codes)
        codes = [];
    //TODO: Bettter loop?
    var newCodes = [];
    while (detectedCodes.length > 0) {
        var code = detectedCodes.pop();
        if (codes.indexOf(code) == -1) {
            //New code
            console.log("New code detected: " + code);
            console.log("Uploading code: " + code);
            newCodes.push(code);
            //TODO: Upload process
            //TODO: Need a delay here somewhere between uploads?
            //Stop processing till a delay happens
            return;
        }
        else {
            console.debug("Duplicate code: " + code);
        }
    }
    if (newCodes.length > 0) {
        console.log("New codes detected, saving list.");
        chrome.storage.sync.set({ UNUPLOADED_SETTING: newCodes }, function () {
            clearTimeout(_timeout);
            _timeout = setTimeout(function () { newCodeAlarmUpload(codes, detectedCodes); }, 5000);
        });
    }
}
var server = "https://ps7.idlechampions.com/~idledragons/post.php";
function getServer() {
    return __awaiter(this, void 0, void 0, function () {
        var request, response, serverDefs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = new URL('https://master.idlechampions.com/~idledragons/post.php');
                    request.searchParams.append("call", "getPlayServerForDefinitions");
                    request.searchParams.append("mobile_client_version", "999");
                    return [4 /*yield*/, fetch(request.toString())];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    serverDefs = _a.sent();
                    server = serverDefs.play_server + "/post.php";
                    return [2 /*return*/, serverDefs.play_server];
                case 3: return [2 /*return*/, null];
            }
        });
    });
}
function uploadCode() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                //TODO: Upload
                //fetch()
                //TODO: If fail, refresh instance, then retry
                return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 2000); })];
                case 1:
                    //TODO: Upload
                    //fetch()
                    //TODO: If fail, refresh instance, then retry
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
//TODO: Alarm to loop over new codes?
