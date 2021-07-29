/// <reference path="./../lib/chrome.d.ts" />

class Globals {
    static debugMode = !chrome.runtime.getManifest().update_url;

    static discordChannelUrl = "https://discord.com/channels/357247482247380994/358044869685673985";

    static SETTING_CODES = "redeemedCodes";
    static SETTING_PENDING = "pendingCodes";
    static SETTING_INSTANCE_ID = "instanceId";
    static SETTING_USER_HASH = "userHash";
    static SETTING_USER_ID = "userId";
}

interface IdleMessage{
    messageType: MessageType;
    codes?: string[];
    messageText?: string;
    chests?: {[chestType: number]: number}
}

const enum MessageType{
    Codes = "codes",
    Error = "error",
    Success = "success",
    Info = "info",
    MissingCredentials = "missingCredentials",
    ScanCodes = "scanCodes",
    CloseTab = "closeTab",
    PageReady = "pageReady",
    ActivateTab = "activateTab",
}