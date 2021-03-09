const SHIFTS_CODES = {'manha': 1, 'tarde': 2, 'noite': 3}

const Class = require('./Class')
const Schedule = require('./Schedule')
const TeacherStore = require('../stores/TeacherStore')

const classes = require('../classes')

class Allocation {
    constructor() {
        this.teacherStore = new TeacherStore()
        this.schedules = this.createSchedules()
    }

    createSchedules() {
        let schedules = []
        for (let klass_code of Object.keys(classes)) {
            let klass = new Class(klass_code, this.teacherStore)
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

        this.updateTeachersClasses()
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

    updateTeachersClasses() {
        for (let teacher of this.teacherStore.all()) {
            teacher.clear()
        }
        for (let schedule of this.schedules) {
            schedule.updateTeachersClasses()
        }
        // for (let teacher of this.teacherStore.all()) {
        //     console.log(teacher.name, Object.keys(teacher.getWorkingDays()))
        // }
        // let teacher = this.teacherStore.get('ranieri')
        // console.dir(teacher.getWorkingDays())
    }

    score() {
        let score = 0
        for (let schedule of this.schedules) {
            score += schedule.score()
        }
        for (let teacher of this.teacherStore.all()) {
            let workingDays = Object.keys(teacher.getWorkingDays()).length
            // console.log(teacher.name, workingDays)
            score += (3 - workingDays) * 3
        }
        return score
    }

    printTable() {
        for (let schedule of this.schedules) {
            console.log(schedule.class.code)
            schedule.printTable()
        }
    }
}

module.exports = Allocation