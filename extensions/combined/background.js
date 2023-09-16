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
    await chrome.storage.sync.get(["nextWeekAtWeekend"]).then((result) => {nextWeekAtWeekend = result.nextWeekAtWeekend ?? true});
    if (!nextWeekAtWeekend) return;
    chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ["przegladaj_plan_lekcji.inject-script.js"],
        world: "MAIN"
      });
}, filter);