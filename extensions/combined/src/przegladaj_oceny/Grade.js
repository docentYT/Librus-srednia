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


function gradesTdToList(gradesTd, plusValue, minusValue, tylkoLiczDoSredniej, ignoreCorrectedGrades) {
    list = [];

    let grades = gradesTd.children;
    for (const gradeGroup of grades) {
        const gradesInGradeGroup = gradeGroup.children;
        if (gradesInGradeGroup[0].tagName == "SPAN") {
            if (ignoreCorrectedGrades) list.push(parseGradeFromHtmlObject(gradesInGradeGroup[gradesInGradeGroup.length-1].getElementsByTagName("a")[0]));
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