class Grade {
    constructor(value, weight, countToAverage) {
        this.value = value
        this.weight = weight
        this.countToAverage = countToAverage
    }
}

class Subject {
    constructor(name, gradesFirstList, gradesSecondList) {
        this.name = name
        this.gradesFirst = gradesFirstList
        this.gradesSecond = gradesSecondList
    }
}

function parseGradeFromHtmlObject(html) {
    function parseWeight(text) {
        weight = parseInt(text[6])
        if (isNaN(weight)) return 1
        return weight
    }

    function parseCountToAverage(text) {
        return text.includes("tak")
    }

    function parseValue(text) {
        value = parseInt(text)
        if (isNaN(value)) return text
        if      (text[1] == '+') value += 0.5  // grade with '+'
        else if (text[1] == '-') value -= 0.25 // grade with '-'
        return value
    }

    title = html.getAttribute("title")
    titleArray = title.split("<br>")
    
    value = parseValue(html.innerText)
    weight = 1
    countToAverage = false
    for (const text of titleArray) {
        if      (text.includes("Waga: "))               weight          = parseWeight(text)
        else if (text.includes("Licz do średniej:"))    countToAverage  = parseCountToAverage(text)
    }
    return new Grade(value, weight, countToAverage)
}

function getTopLevelChildByTagName(element, tagName) {
    let childs = element.getElementsByTagName(tagName)
    
    if (!childs || childs.length == 0) return null
    for (const child of childs) {
        if (child.parentNode === element) return child
    }
    return null
}

function gradesTdToList(gradesTd) {
    list = []

    var grades = gradesTd.getElementsByTagName("span")
    if (!grades || grades.length == 0) return list
    for (var i = 0; i < grades.length; i++) {
        gradeHtmlList = grades[i].getElementsByTagName("a")
        if (!gradeHtmlList || gradeHtmlList.length == 0) return list
        gradeHtml = gradeHtmlList[0]
        grade = parseGradeFromHtmlObject(gradeHtml)
        list.push(grade)
    }
    return list
}

function average(gradesList) {
    sum = 0
    counter = 0
    if (gradesList.length == 0) return (0).toFixed(2)
    for (var i = 0; i < gradesList.length; i++) {
        grade = gradesList[i]
        if (grade.countToAverage && !isNaN(grade.value)) {
            sum += (grade.value * grade.weight)
            counter += grade.weight
        }
    }
    return (sum/counter).toFixed(2)
}

function generateFooter(tfoot, subjects) {
    function createTd(colspan) {
        td = document.createElement("td")
        td.setAttribute("colspan", colspan)
        return td
    }
    tr = getTopLevelChildByTagName(tfoot, "tr")
    getTopLevelChildByTagName(tr, "td").remove()

    gradesFirst = []
    gradesSecond = []
    for (var i = 0; i < subjects.length; i++) {
        subjectFirstGrades = subjects[i].gradesFirst
        gradesFirst = gradesFirst.concat(subjectFirstGrades)

        subjectSecondGrades = subjects[i].gradesSecond
        gradesSecond = gradesSecond.concat(subjectSecondGrades)
    }
    tr.appendChild(createTd(1)) // Spacing
    totalAverageName = createTd(1)
    totalAverageName.innerText = "Średnia ze wszystkich ocen"
    tr.appendChild(totalAverageName)
    tr.appendChild(createTd(1)) // Spacing

    // First term
    totalAverageFirst = createTd(1)
    totalAverageFirst.textContent = average(gradesFirst)
    tr.appendChild(totalAverageFirst)

    tr.appendChild(createTd(2)) // Spacing

    // Second term
    totalAverageSecond = createTd(1)
    totalAverageSecond.textContent = average(gradesSecond)
    tr.appendChild(totalAverageSecond)

    tr.appendChild(createTd(1)) // Spacing

    // Average year
    totalAverageYear = createTd(1)
    totalAverageYear.textContent = average(gradesFirst.concat(gradesSecond))
    tr.appendChild(totalAverageYear)

    tr.appendChild(createTd(1)) // Spacing
}

function updateAverage(tds, subject) {
    averageFirst = tds[3]
    averageFirst.textContent = average(subject.gradesFirst)

    averageSecond = tds[6]
    averageSecond.textContent = average(subject.gradesSecond)

    averageYear = tds[8]
    averageYear.textContent = average(subject.gradesFirst.concat(subject.gradesSecond))
}

function main() {
    let table = document.getElementsByClassName("decorated stretch")[1]
    let tbody = getTopLevelChildByTagName(table, "tbody")

    subjectList = []
    for (const subject of tbody.children) {
        if (subject.hasAttribute("name")) continue
        tds = subject.getElementsByTagName("td")
        subjectName = tds[1].textContent
        if (subjectName.includes("Zachowanie")) continue

        gradesFirst = tds[2]
        gradesSecond = tds[5]
        gradesFirstList = gradesTdToList(gradesFirst)
        gradesSecondList = gradesTdToList(gradesSecond)
        subjectObject = new Subject(subjectName, gradesFirstList, gradesSecondList)
        
        updateAverage(tds, subjectObject)
        
        subjectList.push(new Subject(subjectName, gradesFirstList, gradesSecondList))
    }
    generateFooter(getTopLevelChildByTagName(table, "tfoot"), subjectList)
}

main()