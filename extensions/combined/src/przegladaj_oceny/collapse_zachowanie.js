"use strict";
async function main() {
    const schowajZachowanie = await chrome.runtime.sendMessage({ "message": "getSetting", "key": "schowajZachowanie" });
    if (schowajZachowanie) document.getElementById("przedmioty_zachowanie_node").click();
};

main();