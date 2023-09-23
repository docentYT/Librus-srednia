"use strict";
import storage from "./Storage";

const filter = {
    url: [
        {
            urlMatches: "https://synergia.librus.pl/przegladaj_plan_lekcji"
        },
        {
            urlMatches: "http://synergia.librus.pl/przegladaj_plan_lekcji"
        },
    ],
};

chrome.webNavigation.onCreatedNavigationTarget.addListener(async (details) => {
    let nextWeekAtWeekend;
    await chrome.storage.sync.get(["nextWeekAtWeekend"]).then((result) => { nextWeekAtWeekend = result.nextWeekAtWeekend ?? true });
    if (!nextWeekAtWeekend) return;
    chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ["przegladaj_plan_lekcji.inject-script.js"],
        world: "MAIN"
    });
}, filter);

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