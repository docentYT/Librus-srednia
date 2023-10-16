"use strict";
import {getTopLevelChildByTagName} from "../../utils"

var wasGrades = false;
function grades() {
    if (wasGrades) return "gradesSecondTerm";
    wasGrades = true;
    return "gradesFirstTerm";
}

const mapColumnHeadersToTdsIndexes = new Map([
    ["Oceny bieżące", grades],
    ["Śr.I", "averageFirstTerm"],
    ["(I)", "annualFirstPredirect"],
    ["I", "annualFirst"],
    ["Śr.II", "averageSecondTerm"],
    ["(II)", "annualSecondPredirect"],
    ["II", "annualSecond"],
    ["Śr.R", "averageYear"],
    ["(R)", "annualYearPredirect"],
    ["R", "annualYear"]
])

export function generateTdsIndexes(table) {
    let tdsIndexes = new Map([["subjectName", 1]]);

    const tableHead = getTopLevelChildByTagName(table, "thead");
    const rowWithDescriptions = tableHead.children[1]; // Second row with column descriptions: "oceny bieżące", "Śr. I" etc.
    let array = Array.from(rowWithDescriptions.children);

    let counter = 2;
    for (const column of array) {
        const mappedKey = mapColumnHeadersToTdsIndexes.get(column.innerText);
        const key = typeof mappedKey === "function" ? mappedKey() : mappedKey;
        tdsIndexes.set(key, counter);
        counter++;
    }

    return tdsIndexes;
}

// tdsIndexes = {
//     "subjectName": 1,
//     "gradesFirstTerm": 2,
//     "averageFirstTerm": 3,
//     "annualFirstPredirect": 4,
//     "annualFirst": 5,
//     "gradesSecondTerm": 6,
//     "averageSecondTerm": 7,
//     "annualSecondPredirect": 8,
//     "annualSecond": 9,
//     "averageYear": 10,
//     "annualYearPredirect": 11,
//     "annualYear": 12
// };