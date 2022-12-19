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
            "gradesSecondTerm": 5,
            "averageSecondTerm": 6,
            "averageYear": 8
        };
    } else if (firstRowLength == 11) {
        tdsIndexes = {
            "tableRowLength": firstRowLength,
            "subjectName": 1,
            "gradesFirstTerm": 2,
            "averageFirstTerm": 3,
            "gradesSecondTerm": 6,
            "averageSecondTerm": 7,
            "averageYear": 9
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
    return (sum/counter).toFixed(2);
};

function generateFooter(tfoot, subjects) {
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
    totalAverageName.innerText = "Średnia ze wszystkich ocen";
    tr.appendChild(totalAverageName);
    tr.appendChild(createTd(1)); // Spacing

    createTdWithAverageFromGradesList(gradesFirst);
    if (tdsIndexes.tableRowLength == 10) tr.appendChild(createTd(2));   // Spacing
    else tr.appendChild(createTd(3));                                   // Spacing
    createTdWithAverageFromGradesList(gradesSecond);
    tr.appendChild(createTd(1)); // Spacing
    createTdWithAverageFromGradesList(gradesFirst.concat(gradesSecond));
    tr.appendChild(createTd(1)); // Spacing
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

async function main() {
    let table = document.getElementsByClassName("decorated stretch")[1];
    let tbody = Utils.getTopLevelChildByTagName(table, "tbody");

    generateTdsIndexes(tbody.children[0].children.length);

    let plusValue;
    let minusValue;
    let tylkoLiczDoSredniej
    await chrome.storage.local.get(["plus"]).then((result) => {plusValue = result.plus ?? 0.5});
    await chrome.storage.local.get(["minus"]).then((result) => {minusValue = result.minus ?? 0.25});
    await chrome.storage.local.get(["tylkoLiczDoSredniej"]).then((result) => {tylkoLiczDoSredniej = result.minus ?? true});
    let subjectList = await generateSubjectListFromGradesTableBody(tbody, plusValue, minusValue, tylkoLiczDoSredniej);
    generateFooter(Utils.getTopLevelChildByTagName(table, "tfoot"), subjectList);
};

main();