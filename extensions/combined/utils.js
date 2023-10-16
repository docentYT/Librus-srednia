function getTopLevelChildByTagName(element, tagName) {
    let childs = element.getElementsByTagName(tagName);
    
    if (!childs || childs.length == 0) return null;
    for (const child of childs) {
        if (child.parentNode === element) return child;
    };
    return null;
};

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

module.exports = {getTopLevelChildByTagName, average};