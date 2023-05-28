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
    } else if (firstRowLength == 12) {
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
            "annualYearPredirect": 10,
            "annualYear": 11
        };
    }
    else if (firstRowLength == 13) {
        tdsIndexes = {
            "tableRowLength": firstRowLength,
            "subjectName": 1,
            "gradesFirstTerm": 2,
            "averageFirstTerm": 3,
            "annualFirstPredirect": 4,
            "annualFirst": 5,
            "gradesSecondTerm": 6,
            "averageSecondTerm": 7,
            "annualSecondPredirect": 8,
            "annualSecond": 9,
            "averageYear": 10,
            "annualYearPredirect": 11,
            "annualYear": 12
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
    
    if (tdsIndexes.tableRowLength == 11 || tdsIndexes.tableRowLength == 12) {
      let annualFirstPredirect = createTd(1);
      annualFirstPredirect.innerText = annuals["annualFirstPredirect"];
      tr.appendChild(annualFirstPredirect);
    };

    let annualFirst = createTd(1);
    annualFirst.innerText = annuals["annualFirst"];
    tr.appendChild(annualFirst);

    tr.appendChild(createTd(1));  // Spacing
    createTdWithAverageFromGradesList(gradesSecond);
    
    if (tdsIndexes.tableRowLength == 13) {
        let annualPredirectSecond = createTd(1);
        annualPredirectSecond.innerText = annuals["annualPredirectSecond"];
        tr.appendChild(annualPredirectSecond);
    }

    let annualSecond = createTd(1);
    annualSecond.innerText = annuals["annualSecond"];
    tr.appendChild(annualSecond);

    createTdWithAverageFromGradesList(gradesFirst.concat(gradesSecond));
    
    let annualYearPredirect = createTd(1);
    annualYearPredirect.innerText = annuals["annualYearPredirect"];
    tr.appendChild(annualYearPredirect);

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
        console.log(tds);
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