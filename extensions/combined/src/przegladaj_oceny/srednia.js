"use strict";
const Grade = require("./Grade");
const Subject = require("./Subject");
const Utils = require("../../utils");
const GenerateTdsIndexes = require("./generateTdsIndexes");

var tdsIndexes;

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

function generateFooter(tfoot, subjects, annuals) {
    function generateTd(innerText, title) {
        let td = document.createElement("td");
        td.setAttribute("colspan", 1);
        if (title) td.setAttribute("title", title);
        td.innerText = innerText || null;
        tr.appendChild(td);
    }
    var tr = Utils.getTopLevelChildByTagName(tfoot, "tr");
    Utils.getTopLevelChildByTagName(tr, "td").remove();

    const {gradesFirst, gradesSecond} = Grade.gradesFromSubjects(subjects);

    generateTd(); // Spacing
    generateTd("Średnie", "Średnie wyliczone dzięki wtyczce Librus Średnia wykonanej przez https://docentcompany.com");

    if (tdsIndexes.hasOwnProperty("gradesFirstTerm"))       generateTd();
    if (tdsIndexes.hasOwnProperty("averageFirstTerm"))      generateTd(average(gradesFirst), "Średnia ocen z pierwszego semestu ze wszystkich przedmiotów.");
    if (tdsIndexes.hasOwnProperty("annualFirstPredirect"))  generateTd(annuals["annualFirstPredirect"], "Średnia ocen przewidywanych na pierwszy semestr.");
    if (tdsIndexes.hasOwnProperty("annualFirst"))           generateTd(annuals["annualFirst"], "Średnia ocen śródrocznych na pierwszy semestr.");

    if (tdsIndexes.hasOwnProperty("gradesSecondTerm"))      generateTd();
    if (tdsIndexes.hasOwnProperty("averageSecondTerm"))     generateTd(average(gradesSecond), "Średnia ocen z drugiego semestu ze wszystkich przedmiotów.");
    if (tdsIndexes.hasOwnProperty("annualSecondPredirect")) generateTd(annuals["annualSecondPredirect"], "Średnia ocen przewidywanych na drugi semestr.");
    if (tdsIndexes.hasOwnProperty("annualSecond"))          generateTd(annuals["annualSecond"], "Średnia ocen śródrocznych na drugi semestr.");

    if (tdsIndexes.hasOwnProperty("averageYear"))           generateTd(average(gradesFirst.concat(gradesSecond)), "Średnia ocen z pierwszego i drugiego semestu łącznie ze wszystkich przedmiotów.");
    if (tdsIndexes.hasOwnProperty("annualYearPredirect"))   generateTd(annuals["annualYearPredirect"], "Średnia ocen przewidywanych na koniec roku.");
    if (tdsIndexes.hasOwnProperty("annualYear"))            generateTd(annuals["annualYear"], "Średnia ocen rocznych.");
};

function updateAverage(tds, subject) {
    function updadeAverageForAnnual(tdsIndexKey, grades, title) {
        if (!tdsIndexes.hasOwnProperty(tdsIndexKey)) return;
        const td = tds[tdsIndexes[tdsIndexKey]];
        td.textContent = average(grades);
        td.setAttribute("title", title);
        td.setAttribute("class", "center");
    }
    updadeAverageForAnnual("averageFirstTerm", subject.gradesFirst, "Średnia ocen z pierwszego semestu z jednego przedmiotu.");
    updadeAverageForAnnual("averageSecondTerm", subject.gradesSecond, "Średnia ocen z drugiego semestu z jednego przedmiotu.");
    updadeAverageForAnnual("averageYear", subject.gradesFirst.concat(subject.gradesSecond), "Średnia ocen z pierwszego i drugiego semesteru łącznie z jednego przedmiotu.");
};

function generateSubjectListFromGradesTableBody(tbody, plusValue, minusValue, tylkoLiczDoSredniej, ignoreCorrectedGrades) {
    let subjectList = [];
    for (const subject of tbody.children) {
        if (subject.hasAttribute("name")) continue;
        let tds = subject.getElementsByTagName("td");
        let subjectName = tds[tdsIndexes.subjectName].textContent;
        if (subjectName.includes("Zachowanie")) continue;

        let gradesFirstList  = Grade.gradesTdToList(tds[tdsIndexes.gradesFirstTerm], plusValue, minusValue, tylkoLiczDoSredniej, ignoreCorrectedGrades);
        let gradesSecondList = Grade.gradesTdToList(tds[tdsIndexes.gradesSecondTerm], plusValue, minusValue, tylkoLiczDoSredniej, ignoreCorrectedGrades);
        let subjectObject = new Subject(subjectName, gradesFirstList, gradesSecondList);
        
        updateAverage(tds, subjectObject);
        
        subjectList.push(new Subject(subjectName, gradesFirstList, gradesSecondList));
    };
    return subjectList;
};

function annualAssements(tbody) {
    let annuals = {};

    function parseAnnual(tds, tdsIndex) {
        let grade = tds[tdsIndex];
        if (!grade) return null;
        grade = Utils.getTopLevelChildByTagName(grade, "span");
        if (!grade) return null;
        grade = Utils.getTopLevelChildByTagName(grade, "a");
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
        let subjectName = tds[tdsIndexes.subjectName].textContent;
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
    let table = document.getElementsByClassName("decorated stretch")[1];
    let tbody = Utils.getTopLevelChildByTagName(table, "tbody");

    tdsIndexes = GenerateTdsIndexes.generateTdsIndexes(table);

    let plusValue;
    let minusValue;
    let tylkoLiczDoSredniej;
    let ignoreCorrectedGrades;

    await chrome.storage.sync.get(["plus"]).then((result) => {plusValue = result.plus ?? 0.5});
    await chrome.storage.sync.get(["minus"]).then((result) => {minusValue = result.minus ?? 0.25});
    await chrome.storage.sync.get(["tylkoLiczDoSredniej"]).then((result) => {tylkoLiczDoSredniej = result.tylkoLiczDoSredniej ?? true});
    await chrome.storage.sync.get(["ignoreCorrectedGrades"]).then((result) => {ignoreCorrectedGrades = result.ignoreCorrectedGrades ?? true})
    let subjectList = await generateSubjectListFromGradesTableBody(tbody, plusValue, minusValue, tylkoLiczDoSredniej, ignoreCorrectedGrades);
    let annuals = annualAssements(tbody);
    generateFooter(Utils.getTopLevelChildByTagName(table, "tfoot"), subjectList, annuals);
};

main();