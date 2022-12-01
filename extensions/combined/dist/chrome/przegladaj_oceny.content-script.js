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

function parseGradeFromHtmlObject(html) {
    function parseWeight(text) {
        weight = parseInt(text[6]);
        if (isNaN(weight)) return 1;
        return weight;
    };

    function parseCountToAverage(text) {
        return text.includes("tak");
    };

    function parseValue(text) {
        value = parseInt(text);
        if (isNaN(value)) return text;
        if      (text[1] == '+') value += 0.5;  // grade with '+'
        else if (text[1] == '-') value -= 0.25; // grade with '-'
        return value;
    };

    title = html.getAttribute("title");
    titleArray = title.split("<br>");
    
    value = parseValue(html.innerText);
    weight = 1;
    countToAverage = false;
    for (const text of titleArray) {
        if      (text.includes("Waga: "))               weight          = parseWeight(text);
        else if (text.includes("Licz do średniej:"))    countToAverage  = parseCountToAverage(text);
    };
    return new Grade(value, weight, countToAverage);
};


function gradesTdToList(gradesTd) {
    list = [];

    var grades = gradesTd.getElementsByTagName("span");
    if (!grades || grades.length == 0) return list;
    for (var i = 0; i < grades.length; i++) {
        gradeHtmlList = grades[i].getElementsByTagName("a");
        if (!gradeHtmlList || gradeHtmlList.length == 0) return list;
        gradeHtml = gradeHtmlList[0];
        grade = parseGradeFromHtmlObject(gradeHtml);
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

document.getElementById("przedmioty_zachowanie_node").click();

/***/ }),

/***/ 979:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const Grade = __webpack_require__(370);
const Subject = __webpack_require__(409);
const Utils = __webpack_require__(947);

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