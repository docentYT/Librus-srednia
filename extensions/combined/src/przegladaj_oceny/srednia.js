const Grade = require("./Grade");
const Subject = require("./Subject");
const Utils = require("./utils");

var tdsIndexes;
function generateTdsIndexes(firstRowLength) {
    if (firstRowLength == 10) {
        tdsIndexes = {
            "tableRowLength": firstRowLength,
            "subjectName": 1,
            "gradesFirstTerm": 2,
            "averageFirstTerm": 3,
            "annualFirst": 4,
            "gradesSecondTerm": 5,
            "averageSecondTerm": 6,
            "annualSecond": 7,
            "averageYear": 8,
            "annualYear": 9,
        };
    } else if (firstRowLength == 11) {
        tdsIndexes = {
            "tableRowLength": firstRowLength,
            "subjectName": 1,
            "gradesFirstTerm": 2,
            "averageFirstTerm": 3,
            "annualFirstPredirect": 4,
            "annualFirst": 5,
            "gradesSecondTerm": 6,
            "averageSecondTerm": 7,
            "annualSecond": 8,
            "averageYear": 9,
            "annualYear": 10
        };
    } else {
        console.log("Librus Średnia: Ilość kolumn w tabeli z ocenami:", firstRowLength, " proszę zgłosić do developera.")
    }
};

function average(gradesList) {
    let sum = 0;
    let counter = 0;
    if (gradesList.length == 0) return (0).toFixed(2);
    for (let i = 0; i < gradesList.length; i++) {
        let grade = gradesList[i];
        if (grade.countToAverage && !isNaN(grade.value)) {
            sum += (grade.value * grade.weight);
            counter += grade.weight;
        };
    };
    let temp_average = (sum/counter).toFixed(2);
    if (isNaN(temp_average))    return (0).toFixed(2);
    else                        return temp_average;
};

function generateFooter(tfoot, subjects, annuals) {
    function createTd(colspan) {
        let td = document.createElement("td");
        td.setAttribute("colspan", colspan);
        return td;
    };
    var tr = Utils.getTopLevelChildByTagName(tfoot, "tr");
    Utils.getTopLevelChildByTagName(tr, "td").remove();

    function createTdWithAverageFromGradesList(gradesList) {
        let td = createTd(1);
        td.textContent = average(gradesList);
        tr.appendChild(td);
    };

    const {gradesFirst, gradesSecond} = Grade.gradesFromSubjects(subjects);

    tr.appendChild(createTd(1)); // Spacing
    let totalAverageName = createTd(1);
    totalAverageName.innerText = "Średnie";
    tr.appendChild(totalAverageName);
    tr.appendChild(createTd(1)); // Spacing

    createTdWithAverageFromGradesList(gradesFirst);
    
    if (tdsIndexes.tableRowLength == 11) {
      let annualFirstPredirect = createTd(1);
      annualFirstPredirect.innerText = annuals["annualFirstPredirect"];
      tr.appendChild(annualFirstPredirect);
    };

    let annualFirst = createTd(1);
    annualFirst.innerText = annuals["annualFirst"];
    tr.appendChild(annualFirst);

    tr.appendChild(createTd(1));  // Spacing
    createTdWithAverageFromGradesList(gradesSecond);
    
    let annualSecond = createTd(1);
    annualSecond.innerText = annuals["annualSecond"];
    tr.appendChild(annualSecond);

    createTdWithAverageFromGradesList(gradesFirst.concat(gradesSecond));
    
    let annualYear = createTd(1);
    annualYear.innerText = annuals["annualYear"];
    tr.appendChild(annualYear);
};

function updateAverage(tds, subject) {
    tds[tdsIndexes.averageFirstTerm].textContent    = average(subject.gradesFirst);
    tds[tdsIndexes.averageSecondTerm].textContent   = average(subject.gradesSecond);
    tds[tdsIndexes.averageYear].textContent         = average(subject.gradesFirst.concat(subject.gradesSecond));
};

function generateSubjectListFromGradesTableBody(tbody, plusValue, minusValue, tylkoLiczDoSredniej) {
    let subjectList = [];
    for (const subject of tbody.children) {
        if (subject.hasAttribute("name")) continue;
        let tds = subject.getElementsByTagName("td");
        let subjectName = tds[tdsIndexes.subjectName].textContent;
        if (subjectName.includes("Zachowanie")) continue;

        let gradesFirstList  = Grade.gradesTdToList(tds[tdsIndexes.gradesFirstTerm], plusValue, minusValue, tylkoLiczDoSredniej);
        let gradesSecondList = Grade.gradesTdToList(tds[tdsIndexes.gradesSecondTerm], plusValue, minusValue, tylkoLiczDoSredniej);
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
    let annualSecondCounter = 0;
    let annualSecondSum = 0;
    let annualYearCounter = 0;
    let annualYearSum = 0;
    for (const subject of tbody.children) {
        if (subject.hasAttribute("name")) continue;
        let tds = subject.getElementsByTagName("td");
        let subjectName = tds[tdsIndexes.subjectName].textContent;
        if (subjectName.includes("Zachowanie")) continue;

        let annualFirstPredirectGrade = parseAnnual(tds, tdsIndexes.annualFirstPredirect);
        let annualFirstGrade = parseAnnual(tds, tdsIndexes.annualFirst);
        let annualSecondGrade = parseAnnual(tds, tdsIndexes.annualSecond);
        let annualYearGrade = parseAnnual(tds, tdsIndexes.annualYear);
        if (annualFirstPredirectGrade) {
            annualFirstPredirectCounter++;
            annualFirstPredirectSum += annualFirstPredirectGrade;
        }
        if (annualFirstGrade) {
            annualFirstCounter++;
            annualFirstSum += annualFirstGrade;
        }
        if (annualSecondGrade) {
            annualSecondCounter++;
            annualSecondSum += annualSecondSum;
        }
        if (annualYearGrade) {
            annualYearCounter++;
            annualYearSum += annualYearGrade;
        }
    }
    annuals["annualFirstPredirect"] = (annualFirstPredirectSum / annualFirstPredirectCounter).toFixed(2);
    annuals["annualFirst"] = (annualFirstSum / annualFirstCounter).toFixed(2);
    annuals["annualSecond"] = (annualSecondSum / annualSecondCounter).toFixed(2);
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

    generateTdsIndexes(tbody.children[0].children.length);

    let plusValue;
    let minusValue;
    let tylkoLiczDoSredniej;
    await chrome.storage.local.get(["plus"]).then((result) => {plusValue = result.plus ?? 0.5});
    await chrome.storage.local.get(["minus"]).then((result) => {minusValue = result.minus ?? 0.25});
    await chrome.storage.local.get(["tylkoLiczDoSredniej"]).then((result) => {tylkoLiczDoSredniej = result.minus ?? true});
    let subjectList = await generateSubjectListFromGradesTableBody(tbody, plusValue, minusValue, tylkoLiczDoSredniej);
    let annuals = annualAssements(tbody);
    generateFooter(Utils.getTopLevelChildByTagName(table, "tfoot"), subjectList, annuals);
};

main();