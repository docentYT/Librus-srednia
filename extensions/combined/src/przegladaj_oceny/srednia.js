"use strict";
const Grade = require("./Grade");
import Subject from "./Subject";
import { getTopLevelChildByTagName } from "../../utils";
import { generateTdsIndexes } from "./generateTdsIndexes";

function average(gradesList) {
    let sum = 0;
    let counter = 0;
    if (gradesList.length == 0) return (0).toFixed(2);
    for (const grade of gradesList) {
        if (grade.countToAverage && !isNaN(grade.value)) {
            sum += (grade.value * grade.weight);
            counter += grade.weight;
        }
    }
    return (sum/counter).toFixed(2);
};

function generateFooter(tfoot, tdsIndexes, subjects, annuals) {
    function generateTd(innerText, title) {
        let td = document.createElement("td");
        td.setAttribute("colspan", 1);
        if (title) td.setAttribute("title", title);
        td.innerText = innerText || null;
        tr.appendChild(td);
    }
    let tr = getTopLevelChildByTagName(tfoot, "tr");
    getTopLevelChildByTagName(tr, "td").remove();

    const {gradesFirst, gradesSecond} = Grade.gradesFromSubjects(subjects);

    generateTd(); // Spacing
    generateTd("Średnie", "Średnie wyliczone dzięki wtyczce Librus Średnia wykonanej przez https://docentcompany.com");

    if (tdsIndexes.get("gradesFirstTerm"))       generateTd();
    if (tdsIndexes.get("averageFirstTerm"))      generateTd(average(gradesFirst), "Średnia ocen z pierwszego semestu ze wszystkich przedmiotów.");
    if (tdsIndexes.get("annualFirstPredirect"))  generateTd(annuals["annualFirstPredirect"], "Średnia ocen przewidywanych na pierwszy semestr.");
    if (tdsIndexes.get("annualFirst"))           generateTd(annuals["annualFirst"], "Średnia ocen śródrocznych na pierwszy semestr.");

    if (tdsIndexes.get("gradesSecondTerm"))      generateTd();
    if (tdsIndexes.get("averageSecondTerm"))     generateTd(average(gradesSecond), "Średnia ocen z drugiego semestu ze wszystkich przedmiotów.");
    if (tdsIndexes.get("annualSecondPredirect")) generateTd(annuals["annualSecondPredirect"], "Średnia ocen przewidywanych na drugi semestr.");
    if (tdsIndexes.get("annualSecond"))          generateTd(annuals["annualSecond"], "Średnia ocen śródrocznych na drugi semestr.");

    if (tdsIndexes.get("averageYear"))           generateTd(average(gradesFirst.concat(gradesSecond)), "Średnia ocen z pierwszego i drugiego semestu łącznie ze wszystkich przedmiotów.");
    if (tdsIndexes.get("annualYearPredirect"))   generateTd(annuals["annualYearPredirect"], "Średnia ocen przewidywanych na koniec roku.");
    if (tdsIndexes.get("annualYear"))            generateTd(annuals["annualYear"], "Średnia ocen rocznych.");
};

function updateAverage(tds, tdsIndexes, subject) {
    function updadeAverageForAnnual(tdsIndexKey, average, title) {
        if (!tdsIndexes.get(tdsIndexKey)) return;
        let td = tds[tdsIndexes.get(tdsIndexKey)];
        td.textContent = average;
        td.setAttribute("title", title);
        td.setAttribute("class", "center");
    }
    updadeAverageForAnnual("averageFirstTerm", subject.averageFirstTerm, "Średnia ocen z pierwszego semestu z jednego przedmiotu.");
    updadeAverageForAnnual("averageSecondTerm", subject.averageSecondTerm, "Średnia ocen z drugiego semestu z jednego przedmiotu.");
    updadeAverageForAnnual("averageYear", subject.averageYear, "Średnia ocen z pierwszego i drugiego semesteru łącznie z jednego przedmiotu.");
};

function generateSubjectListFromGradesTableBody(tbody, tdsIndexes, plusValue, minusValue, tylkoLiczDoSredniej, ignoreCorrectedGrades) {
    let subjectList = [];
    for (const subject of tbody.children) {
        if (subject.hasAttribute("name")) continue; // if it has name it is a table that can be expanded by clicking '+' icon.
        const tds = subject.getElementsByTagName("td");
        const subjectName = tds[tdsIndexes.get("subjectName")].textContent;
        if (subjectName.includes("Zachowanie")) continue;

        const gradesFirstList  = Grade.gradesTdToList(tds[tdsIndexes.get("gradesFirstTerm")], plusValue, minusValue, tylkoLiczDoSredniej, ignoreCorrectedGrades);
        const gradesSecondList = Grade.gradesTdToList(tds[tdsIndexes.get("gradesSecondTerm")], plusValue, minusValue, tylkoLiczDoSredniej, ignoreCorrectedGrades);
        const subjectObject = new Subject(subjectName, gradesFirstList, gradesSecondList);
        
        updateAverage(tds, tdsIndexes, subjectObject);
        
        subjectList.push(new Subject(subjectName, gradesFirstList, gradesSecondList));
    };
    return subjectList;
};

function annualAssements(tbody, tdsIndexes) {
    let annuals = {};

    function parseAnnual(tds, tdsIndex) {
        let grade = tds[tdsIndex];
        if (!grade) return null;
        grade = getTopLevelChildByTagName(grade, "span");
        if (!grade) return null;
        grade = getTopLevelChildByTagName(grade, "a");
        if (!grade || !grade.textContent) return null;
        return parseInt(grade.textContent);
    }

    let annualFirstPredirectCounter = 0;
    let annualFirstPredirectSum = 0;
    let annualFirstCounter = 0;
    let annualFirstSum = 0;
    let annualSecondPredirectCounter = 0;
    let annualSecondPredirectSum = 0;
    let annualSecondCounter = 0;
    let annualSecondSum = 0;
    let annualYearPredirectCounter = 0;
    let annualYearPredirectSum = 0;
    let annualYearCounter = 0;
    let annualYearSum = 0;
    for (const subject of tbody.children) {
        if (subject.hasAttribute("name")) continue;
        let tds = subject.getElementsByTagName("td");
        let subjectName = tds[tdsIndexes.get("subjectName")].textContent;
        if (subjectName.includes("Zachowanie")) continue;

        let annualFirstPredirectGrade = parseAnnual(tds, tdsIndexes.annualFirstPredirect);
        let annualFirstGrade = parseAnnual(tds, tdsIndexes.annualFirst);
        let annualSecondPredirectGrade = parseAnnual(tds, tdsIndexes.annualSecondPredirect);
        let annualSecondGrade = parseAnnual(tds, tdsIndexes.annualSecond);
        let annualYearPredirectGrade = parseAnnual(tds, tdsIndexes.annualYearPredirect);
        let annualYearGrade = parseAnnual(tds, tdsIndexes.annualYear);
        if (annualFirstPredirectGrade) {
            annualFirstPredirectCounter++;
            annualFirstPredirectSum += annualFirstPredirectGrade;
        }
        if (annualFirstGrade) {
            annualFirstCounter++;
            annualFirstSum += annualFirstGrade;
        }
        if (annualSecondPredirectGrade) {
            annualSecondPredirectCounter++;
            annualSecondPredirectSum += annualSecondPredirectGrade;
        }
        if (annualSecondGrade) {
            annualSecondCounter++;
            annualSecondSum += annualSecondGrade;
        }
        if (annualYearPredirectGrade) {
            annualYearPredirectCounter++;
            annualYearPredirectSum += annualYearPredirectGrade;
        }
        if (annualYearGrade) {
            annualYearCounter++;
            annualYearSum += annualYearGrade;
        }
    }
    annuals["annualFirstPredirect"] = (annualFirstPredirectSum / annualFirstPredirectCounter).toFixed(2);
    annuals["annualFirst"] = (annualFirstSum / annualFirstCounter).toFixed(2);
    annuals["annualSecondPredirect"] = (annualSecondPredirectSum / annualSecondPredirectCounter).toFixed(2);
    annuals["annualSecond"] = (annualSecondSum / annualSecondCounter).toFixed(2);
    annuals["annualYearPredirect"] = (annualYearPredirectSum / annualYearPredirectCounter).toFixed(2);
    annuals["annualYear"] = (annualYearSum / annualYearCounter).toFixed(2);

    if (isNaN(annuals["annualFirstPredirect"])) annuals["annualFirstPredirect"] = (0).toFixed(2);
    if (isNaN(annuals["annualFirst"]))          annuals["annualFirst"] = (0).toFixed(2);
    if (isNaN(annuals["annualSecond"]))         annuals["annualSecond"] = (0).toFixed(2);
    if (isNaN(annuals["annualYear"]))           annuals["annualYear"] = (0).toFixed(2);

    return annuals;
}

async function main() {
    const table = document.getElementsByClassName("decorated stretch")[1];
    const tbody = getTopLevelChildByTagName(table, "tbody");

    const tdsIndexes = generateTdsIndexes(table);

    const plusValue = await chrome.runtime.sendMessage({ "message": "getSetting", "key": "plus" });
    const minusValue = await chrome.runtime.sendMessage({ "message": "getSetting", "key": "minus" });
    const tylkoLiczDoSredniej = await chrome.runtime.sendMessage({ "message": "getSetting", "key": "tylkoLiczDoSredniej" });
    const ignoreCorrectedGrades = await chrome.runtime.sendMessage({ "message": "getSetting", "key": "ignoreCorrectedGrades" });

    let subjectList = generateSubjectListFromGradesTableBody(tbody, tdsIndexes, plusValue, minusValue, tylkoLiczDoSredniej, ignoreCorrectedGrades);
    let annuals = annualAssements(tbody, tdsIndexes);
    generateFooter(getTopLevelChildByTagName(table, "tfoot"), tdsIndexes, subjectList, annuals);
};

main();