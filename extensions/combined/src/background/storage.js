"use strict";
// https://stackoverflow.com/questions/1479319/simplest-cleanest-way-to-implement-a-singleton-in-javascript
let storage = (function () {
    const corrrectSettingsObject = {
        plus: 0.5,
        minus: 0.25,
        tylkoLiczDoSredniej: true,
        schowajZachowanie: true,
        ignoreCorrectedGrades: true,
        nextWeekAtWeekend: true
    }

    let cache = {}

    function checkSettingsObject(settingsObject) {
        if (Object.keys(settingsObject).length != Object.keys(corrrectSettingsObject).length) {
            throw new Error(`Settings object length is ${Object.keys(settingsObject).length}. Expected ${Object.keys(corrrectSettingsObject).length}`)
        }

        Object.keys(corrrectSettingsObject).forEach((property) => {
            if (!settingsObject.hasOwnProperty(property)) {
                throw new Error(`Settings object has no ${property} property.`)
            };
        })

        return true;
    }

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

Object.freeze(storage);

module.exports = storage();