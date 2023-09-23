"use strict";
document.addEventListener("DOMContentLoaded", async function () {
    let plusInput = document.getElementById("plus");
    let minusInput = document.getElementById("minus");
    let tylkoLiczDoSredniej = document.getElementById("tylkoLiczDoSredniej");
    let schowajZachowanie = document.getElementById("schowajZachowanie");
    let ignoreCorrectedGrades = document.getElementById("ignoreCorrectedGrades");
    let nextWeekAtWeekend = document.getElementById("nextWeekAtWeekend");
    let submitButton = document.getElementById("submit");

    plusInput.value = await getData("plus");
    minusInput.value = await getData("minus");
    tylkoLiczDoSredniej.checked = await getData("tylkoLiczDoSredniej");
    schowajZachowanie.checked = await getData("schowajZachowanie");
    ignoreCorrectedGrades.checked = await getData("ignoreCorrectedGrades");
    nextWeekAtWeekend.checked = await getData("nextWeekAtWeekend");

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