const SHIFTS_CODES = {'manha': 1, 'tarde': 2, 'noite': 3}

const Class = require('./Class')
const Schedule = require('./Schedule')
const TeacherStore = require('../stores/TeacherStore')

const classes = require('../classes')

class Allocation {
    constructor() {
        this.schedules = this.createSchedules()
    }

    createSchedules() {
        let schedules = []
        for (let klass_code of Object.keys(classes)) {
            let klass = new Class(klass_code)
            let schedule = new Schedule(klass)
            schedules.push(schedule)
        }
        schedules.sort((sch1, sch2) => {
            return SHIFTS_CODES[sch1.class.shift] - SHIFTS_CODES[sch2.class.shift]
        })
        return schedules
    }

    allocate() {
        for (let schedule of this.schedules) {
            schedule.allocate()
        }
        let conflict = this.nextConflict()
        // console.log(conflict)
        while (conflict !== false) {
            let [sch1, sch2] = conflict
            if ([true, false].choice()) {
                // [sch2, sch1] = conflict
                sch1.resolveConflictsWith(sch2)
            } else {
                // sch2.resolveConflictsWith(sch1) // I can't understand why
                sch1.reallocate()
            }
            conflict = this.nextConflict()
        }
    }

    nextConflict() {
        for (let i = 0; i < this.schedules.length; i++) {
            for (let j = i + 1; j < this.schedules.length; j++) {
                let sch1 = this.schedules[i]
                let sch2 = this.schedules[j]
                if (sch1.hasConflictWith(sch2)) {
                    return [sch1, sch2]
                }
            }
        }
        return false
    }

    printTable() {
        for (let schedule of this.schedules) {
            console.log(schedule.class.code)
            schedule.printTable()
        }
    }
}

module.exports = Allocation