"use strict";
import Storage from "./Storage";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message == "saveSettings") {
        Storage.save(request.body);
    }
    else if (request.message == "getSetting") {
        (async () => {
            sendResponse(await Storage.get(request.key));
        })();
        return true;
    }
})