/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 370:
/***/ ((module) => {

class Grade {
    constructor(value, weight, countToAverage) {
        this.value = value;
        this.weight = weight;
        this.countToAverage = countToAverage;
    };
};

function parseGradeFromHtmlObject(html, plusValue, minusValue, tylkoLiczDoSredniej) {
    function parseWeight(text) {
        weight = parseInt(text[6]);
        if (isNaN(weight)) return 1;
        return weight;
    };

    function parseCountToAverage(text, tylkoLiczDoSredniej) {
        if (tylkoLiczDoSredniej) return text.includes("tak");
        else return true;
    };

    function parseValue(text, plusValue, minusValue) {
        value = parseInt(text);
        if (isNaN(value)) return text;
        if      (text[1] == '+') value += plusValue;  // grade with '+'
        else if (text[1] == '-') value -= minusValue; // grade with '-'
        return value;
    };

    title = html.getAttribute("title");
    titleArray = title.split("<br>");
    
    value = parseValue(html.innerText, plusValue, minusValue);
    weight = 1;
    countToAverage = false;
    for (const text of titleArray) {
        if      (text.includes("Waga: "))               weight          = parseWeight(text);
        else if (text.includes("Licz do średniej:"))    countToAverage  = parseCountToAverage(text, tylkoLiczDoSredniej);
    };
    return new Grade(value, weight, countToAverage);
};


function gradesTdToList(gradesTd, plusValue, minusValue, tylkoLiczDoSredniej) {
    list = [];

    var grades = gradesTd.getElementsByTagName("span");
    if (!grades || grades.length == 0) return list;
    for (var i = 0; i < grades.length; i++) {
        gradeHtmlList = grades[i].getElementsByTagName("a");
        if (!gradeHtmlList || gradeHtmlList.length == 0) return list;
        gradeHtml = gradeHtmlList[0];
        grade = parseGradeFromHtmlObject(gradeHtml, plusValue, minusValue, tylkoLiczDoSredniej);
        list.push(grade);
    };
    return list;
}

function gradesFromSubjects(subjects) {
    let gradesFirst = [];
    let gradesSecond = [];
    for (let i = 0; i < subjects.length; i++) {
        let subjectFirstGrades = subjects[i].gradesFirst;
        gradesFirst = gradesFirst.concat(subjectFirstGrades);

        let subjectSecondGrades = subjects[i].gradesSecond;
        gradesSecond = gradesSecond.concat(subjectSecondGrades);
    };
    return {gradesFirst, gradesSecond}
};

module.exports = {Grade, parseGradeFromHtmlObject, gradesTdToList, gradesFromSubjects};

/***/ }),

/***/ 409:
/***/ ((module) => {

class Subject {
    constructor(name, gradesFirstList, gradesSecondList) {
        this.name = name;
        this.gradesFirst = gradesFirstList;
        this.gradesSecond = gradesSecondList;
    };
};

module.exports = Subject;

/***/ }),

/***/ 630:
/***/ (() => {

async function main() {
    let schowajZachowanie;
    await chrome.storage.local.get(["schowajZachowanie"]).then((result) => {schowajZachowanie = result.schowajZachowanie ?? true});
    if (schowajZachowanie) document.getElementById("przedmioty_zachowanie_node").click();
};

main();

/***/ }),

/***/ 979:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const Grade = __webpack_require__(370);
const Subject = __webpack_require__(409);
const Utils = __webpack_require__(947);

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

/***/ }),

/***/ 947:
/***/ ((module) => {

function getTopLevelChildByTagName(element, tagName) {
    let childs = element.getElementsByTagName(tagName);
    
    if (!childs || childs.length == 0) return null;
    for (const child of childs) {
        if (child.parentNode === element) return child;
    };
    return null;
};

module.exports = {getTopLevelChildByTagName};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/* harmony import */ var _src_przegladaj_oceny_collapse_zachowanie__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(630);
/* harmony import */ var _src_przegladaj_oceny_collapse_zachowanie__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_src_przegladaj_oceny_collapse_zachowanie__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _src_przegladaj_oceny_srednia__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(979);
/* harmony import */ var _src_przegladaj_oceny_srednia__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_src_przegladaj_oceny_srednia__WEBPACK_IMPORTED_MODULE_1__);


})();

/******/ })()
;