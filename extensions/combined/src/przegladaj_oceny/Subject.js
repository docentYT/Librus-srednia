import { average } from "../../utils";

export class Subject {
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
        this.averageFirstTerm = average(this.gradesFirst);
        this.averageSecondTerm = average(this.gradesSecond);
        this.averageYear = average(this.gradesFirst.concat(this.gradesSecond));
    }
};