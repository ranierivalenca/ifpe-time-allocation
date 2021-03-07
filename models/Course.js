const courses = require('../courses')
const times = require('../times')

const Discipline = require('./Discipline')

class Course {
    constructor(code, semester) {
        if (!courses[code]) {
            throw `Course ${code} not found`
        }
        let course = courses[code]
        this.code = code
        this.name = course.name
        this.class_time = course.class_time
        this.semesters = course.semesters
        this.shifts = this.loadShifts()
    }

    loadShifts() {
        if (!times[this.class_time]) {
            throw `Shifts for ${this.class_time} classes not defined`
        }
        return times[this.class_time]
    }

    getDisciplines(semester) {
        if (!this.semesters[semester]) {
            throw `Semester ${semester} is not defined for course ${this.code}`
        }
        let disciplines = []
        for (let [code, blocks] of Object.entries(this.semesters[semester]))  {
            disciplines.push(new Discipline(code, blocks))
        }
        return disciplines
    }

    getSlots(shift) {
        if (!this.shifts[shift]) {
            throw `Shift ${shift} is not defined for ${this.class_time} minutes classes`
        }
        return this.shifts[shift]
    }
}

module.exports = Course