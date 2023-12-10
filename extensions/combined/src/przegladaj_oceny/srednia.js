"use strict";
const Grade = require("./Grade");
import {Subject} from "./Subject";
import { getTopLevelChildByTagName, average } from "../../utils";
import { generateTdsIndexes } from "./generateTdsIndexes";

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

function annualAverages(tbody, tdsIndexes) {
    let annualAverages = {};

    let annualsTemp = {
                            // sum, counter (for average: sum/counter)
        annualFirstPredirect: [0,0],
        annualFirst: [0,0],
        annualSecondPredirect: [0,0],
        annualSecond: [0,0],
        annualYearPredirect: [0,0],
        annualYear: [0,0]
    }

    function getAnnualGrade(tds, tdsIndex) {
        let grade = tds[tdsIndex];
        if (!grade) return null;
        grade = getTopLevelChildByTagName(grade, "span");
        if (!grade) return null;
        grade = getTopLevelChildByTagName(grade, "a");
        if (!grade || !grade.textContent) return null;
        return parseInt(grade.textContent);
    }

    function parseAnnual(tds, annualAndTdsKey) {
        const grade = getAnnualGrade(tds, tdsIndexes.get(annualAndTdsKey)); 
        if (grade) {
            annualsTemp[annualAndTdsKey][0] += grade;
            annualsTemp[annualAndTdsKey][1]++;
        }
    }

    function averageForAnnual(annualKey) {
        const sum = annualsTemp[annualKey][0];
        const counter = annualsTemp[annualKey][1];
        if (counter == 0) return (0).toFixed(2);
        return (sum / counter).toFixed(2);
    }

    function saveAverageToAnnualAverages(annualKey) {
        annualAverages[annualKey] = averageForAnnual(annualKey);
    }

    for (const subject of tbody.children) {
        if (subject.hasAttribute("name")) continue;
        const tds = subject.getElementsByTagName("td");
        const subjectName = tds[tdsIndexes.get("subjectName")].textContent;
        if (subjectName.includes("Zachowanie")) continue;

        parseAnnual(tds, "annualFirstPredirect");
        parseAnnual(tds, "annualFirst");
        parseAnnual(tds, "annualSecondPredirect");
        parseAnnual(tds, "annualSecond");
        parseAnnual(tds, "annualYearPredirect");
        parseAnnual(tds, "annualYear");
    }

    saveAverageToAnnualAverages("annualFirstPredirect");
    saveAverageToAnnualAverages("annualFirst");
    saveAverageToAnnualAverages("annualSecondPredirect");
    saveAverageToAnnualAverages("annualSecond");
    saveAverageToAnnualAverages("annualYearPredirect");
    saveAverageToAnnualAverages("annualYear");

    return annualAverages;
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
    let annuals = annualAverages(tbody, tdsIndexes);
    generateFooter(getTopLevelChildByTagName(table, "tfoot"), tdsIndexes, subjectList, annuals);
};

main();