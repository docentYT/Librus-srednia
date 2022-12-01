const Grade = require("./Grade");
const Subject = require("./Subject");
const Utils = require("./utils");

const tdsIndexes = {
    "subjectName": 1,
    "gradesFirstTerm": 2,
    "averageFirstTerm": 3,
    "gradesSecondTerm": 5,
    "averageSecondTerm": 6,
    "averageYear": 8
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
    tr.appendChild(createTd(2)); // Spacing
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

function generateSubjectListFromGradesTableBody(tbody) {
    let subjectList = [];
    for (const subject of tbody.children) {
        if (subject.hasAttribute("name")) continue;
        let tds = subject.getElementsByTagName("td");
        let subjectName = tds[tdsIndexes.subjectName].textContent;
        if (subjectName.includes("Zachowanie")) continue;

        let gradesFirstList  = Grade.gradesTdToList(tds[tdsIndexes.gradesFirstTerm]);
        let gradesSecondList = Grade.gradesTdToList(tds[tdsIndexes.gradesSecondTerm]);
        let subjectObject = new Subject(subjectName, gradesFirstList, gradesSecondList);
        
        updateAverage(tds, subjectObject);
        
        subjectList.push(new Subject(subjectName, gradesFirstList, gradesSecondList));
    };
    return subjectList;
};

function main() {
    let table = document.getElementsByClassName("decorated stretch")[1];
    let tbody = Utils.getTopLevelChildByTagName(table, "tbody");

    let subjectList = generateSubjectListFromGradesTableBody(tbody)
    generateFooter(Utils.getTopLevelChildByTagName(table, "tfoot"), subjectList);
};

main();