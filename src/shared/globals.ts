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