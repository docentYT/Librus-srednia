class Subject {
    constructor(name, gradesFirstList, gradesSecondList) {
        this.name = name;
        this._gradesFirst = gradesFirstList;
        this._gradesSecond = gradesSecondList;
        this.updateAverage();
    };

    get gradesFirst() {
        return this._gradesFirst;
    }

    set gradesFirst(grades) {
        this._gradesFirst = grades;
        updateAverage();
    }

    get gradesSecond() {
        return this._gradesSecond;
    }

    set gradesSecond(grades) {
        this._gradesSecond = grades;
        updateAverage();
    }

    updateAverage() {
        this.averageFirstTerm = Subject.average(this.gradesFirst);
        this.averageSecondTerm = Subject.average(this.gradesSecond);
        this.averageYear = Subject.average(this.gradesFirst.concat(this.gradesSecond));
    }

    static average(gradesList) {
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
};

module.exports = Subject;