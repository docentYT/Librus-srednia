"use strict";
// https://stackoverflow.com/questions/1479319/simplest-cleanest-way-to-implement-a-singleton-in-javascript
let Storage = (function () {
    // Private methods
    const corrrectSettingsObject = {
        plus: 0.5,
        minus: 0.25,
        tylkoLiczDoSredniej: true,
        schowajZachowanie: true,
        ignoreCorrectedGrades: true,
        nextWeekAtWeekend: true
    };
    const correctSettingsObjectLength = Object.keys(corrrectSettingsObject).length;

    let cache = {};

    function checkSettingsObject(settingsObject) {
        let settingsObjectLength = Object.keys(settingsObject).length; 
        if (settingsObjectLength != correctSettingsObjectLength) {
            throw new Error(`Settings object length is ${settingsObjectLength}. Expected ${correctSettingsObjectLength}`)
        }

        Object.keys(corrrectSettingsObject).forEach((property) => {
            if (!settingsObject.hasOwnProperty(property)) {
                throw new Error(`Settings object has no ${property} property.`)
            };
        })

        return true;
    }

    // Public methods
    return {
        save: function (settingsObject) {
            if (checkSettingsObject(settingsObject)) {
                chrome.storage.sync.set(settingsObject);
                cache = settingsObject;
            } else {
                throw new Error("Incorrect settings object");
            }
        },

        get: async function (key) {
            if (cache[key]) {
                return cache[key];
            } else {
                await chrome.storage.sync.get([key]).then((result) => {cache[key] = result[key] ?? corrrectSettingsObject[key] });
                return cache[key];
            }
        }
    }
})

Object.freeze(Storage);

module.exports = Storage();