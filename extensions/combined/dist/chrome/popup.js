document.addEventListener("DOMContentLoaded", async function() {
    var plusInput = document.getElementById("plus");
    let minusInput = document.getElementById("minus");
    let tylkoLiczDoSredniej = document.getElementById("tylkoLiczDoSredniej");
    let schowajZachowanie = document.getElementById("schowajZachowanie");
    let submitButton = document.getElementById("submit");
    
    chrome.storage.sync.get(["plus"]).then((result) => {plusInput.value = result.plus ?? 0.5});
    chrome.storage.sync.get(["minus"]).then((result) => {minusInput.value = result.minus ?? 0.25});
    chrome.storage.sync.get(["tylkoLiczDoSredniej"]).then((result) => {tylkoLiczDoSredniej.checked = result.tylkoLiczDoSredniej ?? true});
    chrome.storage.sync.get(["schowajZachowanie"]).then((result) => {schowajZachowanie.checked = result.schowajZachowanie ?? true});
    submitButton.addEventListener("click", onClickEvent);


    function onClickEvent() {
        saveData(plusInput.value, minusInput.value, tylkoLiczDoSredniej.checked, schowajZachowanie.checked);
    };
});

function saveData(plusValue, minusValue, tylkoLiczDoSredniejValue, schowajZachowanieValue) {
    plusValue = parseFloat(plusValue);
    minusValue = parseFloat(minusValue);

    chrome.storage.sync.set(
        {
            plus: plusValue,
            minus: minusValue,
            tylkoLiczDoSredniej: tylkoLiczDoSredniejValue,
            schowajZachowanie: schowajZachowanieValue
        });
};