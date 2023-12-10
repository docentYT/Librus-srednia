"use strict";
import storage from "./storage";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message == "saveSettings") {
        storage.save(request.body);
    }
    else if (request.message == "getSetting") {
        (async () => {
            sendResponse(await storage.get(request.key));
        })();
        return true;
    }
})