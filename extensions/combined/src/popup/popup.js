"use strict";
document.addEventListener("DOMContentLoaded", async function () {
    const $ = document.querySelector.bind(document);
    
    const plusInput             = $("#plus");
    const minusInput            = $("#minus");
    const tylkoLiczDoSredniej   = $("#tylkoLiczDoSredniej");
    const schowajZachowanie     = $("#schowajZachowanie");
    const ignoreCorrectedGrades = $("#ignoreCorrectedGrades");
    const nextWeekAtWeekend     = $("#nextWeekAtWeekend");
    const submitButton          = $("#submit");

    plusInput.value                 = await getData("plus");
    minusInput.value                = await getData("minus");
    tylkoLiczDoSredniej.checked     = await getData("tylkoLiczDoSredniej");
    schowajZachowanie.checked       = await getData("schowajZachowanie");
    ignoreCorrectedGrades.checked   = await getData("ignoreCorrectedGrades");
    nextWeekAtWeekend.checked       = await getData("nextWeekAtWeekend");

    submitButton.addEventListener("click", () => {
        saveData(plusInput.value, minusInput.value, tylkoLiczDoSredniej.checked, schowajZachowanie.checked, ignoreCorrectedGrades.checked, nextWeekAtWeekend.checked);
        reloadLibrusTab();
    });
});

function saveData(plusValue, minusValue, tylkoLiczDoSredniejValue, schowajZachowanieValue, ignoreCorrectedGradesValue, nextWeekAtWeekendValue) {
    plusValue = parseFloat(plusValue);
    minusValue = parseFloat(minusValue);

    chrome.runtime.sendMessage({
        "message": "saveSettings", "body": {
            plus: plusValue,
            minus: minusValue,
            tylkoLiczDoSredniej: tylkoLiczDoSredniejValue,
            schowajZachowanie: schowajZachowanieValue,
            ignoreCorrectedGrades: ignoreCorrectedGradesValue,
            nextWeekAtWeekend: nextWeekAtWeekendValue
        }
    });
};

async function getData(key) {
    return await chrome.runtime.sendMessage({ "message": "getSetting", "key": key });
}

function reloadLibrusTab() {
    chrome.tabs.query({ url: ["*://synergia.librus.pl/*"] }, function (tabs) {
        tabs.forEach(element => {
            chrome.tabs.reload(element.id);
        });
    });
}