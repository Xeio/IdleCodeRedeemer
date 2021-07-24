/// <reference path="./../lib/chrome.d.ts" />

class Globals {
    static debugMode = !chrome.runtime.getManifest().update_url;

    static discordChannelUrl = "https://discord.com/channels/357247482247380994/358044869685673985";
}