"use strict";
import Storage from "./Storage";

const filter = {
    url: [
        {
            hostSuffix: "synergia.librus.pl",
            pathPrefix: "/przegladaj_plan_lekcji"
        }
    ],
};

chrome.webNavigation.onCreatedNavigationTarget.addListener(async (details) => {
    if (!await Storage.get("nextWeekAtWeekend")) return;
    chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ["przegladaj_plan_lekcji.inject-script.js"],
        world: "MAIN"
    });
}, filter);