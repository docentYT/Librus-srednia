"use strict";
class Grade {
    constructor(value, weight, countToAverage) {
        this.value = value;
        this.weight = weight;
        this.countToAverage = countToAverage;
    };
};

function parseGradeFromHtmlObject(html, plusValue, minusValue, tylkoLiczDoSredniej) {
    function parseWeight(text) {
        const weight = parseInt(text[6]);
        if (isNaN(weight)) return 1;
        return weight;
    };

    function parseCountToAverage(text, tylkoLiczDoSredniej) {
        if (tylkoLiczDoSredniej) return text.includes("tak");
        else return true;
    };

    function parseValue(text, plusValue, minusValue) {
        let value = parseInt(text[0]);
        if (isNaN(value)) return text;
        if (text.length == 2) {
            if      (text[1] == '+') value += plusValue;  // grade with '+'
            else if (text[1] == '-') value -= minusValue; // grade with '-'
        }
        return value;
    };

    const title = html.getAttribute("title");
    const titleArray = title.split("<br>");
    
    const value = parseValue(html.innerText, plusValue, minusValue);
    let weight = 1;
    let countToAverage = false;
    for (const text of titleArray) {
        if      (text.includes("Waga: "))               weight          = parseWeight(text);
        else if (text.includes("Licz do średniej:"))    countToAverage  = parseCountToAverage(text, tylkoLiczDoSredniej);
    };
    return new Grade(value, weight, countToAverage);
};


function gradesTdToList(gradesTd, plusValue, minusValue, tylkoLiczDoSredniej, ignoreCorrectedGrades) {
    let list = [];

    const grades = gradesTd.children;
    for (const gradeGroup of grades) {
        const gradesInGradeGroup = gradeGroup.children;
        if (gradesInGradeGroup[0].tagName == "SPAN") {
            if (ignoreCorrectedGrades) {
                list.push(parseGradeFromHtmlObject(gradesInGradeGroup[gradesInGradeGroup.length-1].getElementsByTagName("a")[0], plusValue, minusValue, tylkoLiczDoSredniej));
            }
            else {
                for (const grade of gradesInGradeGroup) {
                    list.push(parseGradeFromHtmlObject(grade.getElementsByTagName("a")[0], plusValue, minusValue, tylkoLiczDoSredniej));
                }
            }
        }
        else {
            list.push(parseGradeFromHtmlObject(gradesInGradeGroup[0], plusValue, minusValue, tylkoLiczDoSredniej));
        }
    }
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