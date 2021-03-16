const SHIFTS_CODES = {'manha': 1, 'tarde': 2, 'noite': 3}

const fs = require('fs')

const Class = require('./Class')
const Schedule = require('./Schedule')
const TeacherStore = require('../stores/TeacherStore')

const classes = require('../classes')

class Allocation {
    constructor() {
        this.teacherStore = new TeacherStore()
        this.schedules = this.createSchedules()
        this._score_cache = false
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

    loadFromJsonFile(file) {
        let json = JSON.parse(fs.readFileSync(file))
        for (let schedule of this.schedules) {
            schedule.loadFromJson(json[schedule.class.code])
        }
        this.updateTeachersClasses()
        return this
    }

    allocate() {
        for (let schedule of this.schedules) {
            schedule.allocate()
        }
        this.solveConflicts()

        this.updateTeachersClasses()

        return this
    }

    solveConflicts() {
        let conflict = this.nextConflict()
        // console.log(conflict)
        while (conflict !== false) {
            let [sch1, sch2] = conflict
            if ([true, false].choice()) {
                // [sch2, sch1] = conflict
                sch1.resolveConflictsWith(sch2)
            } else {
                // sch2.resolveConflictsWith(sch1) // I can't understand why this doesn't work
                sch2.reallocate()
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

    updateTeachersClasses() {
        this._score_cache = false
        for (let teacher of this.teacherStore.all()) {
            teacher.clearClasses()
            // teacher.name == 'ranieri' ? console.log(teacher) : null
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
        if (this._score_cache !== false) {
            return this._score_cache
        }
        let score = 0
        for (let schedule of this.schedules) {
            score += schedule.score()
        }
        for (let teacher of this.teacherStore.all()) {
            let workingDays = Object.keys(teacher.getWorkingDays()).length
            // console.log(teacher.name, workingDays)
            score += (3 - workingDays) * 3
        }
        this._score_cache = false
        return score
    }

    clone(evolve = false) {
        let allocation = new Allocation()
        for (let schedule of allocation.schedules) {
            schedule.cloneFrom(this.schedules.find(s => s.class.code == schedule.class.code))
        }
        if (evolve) {
            allocation.evolve()
        }
        allocation.updateTeachersClasses()
        return allocation
    }

    evolve() {
        this._score_cache = false
        let mutateRandomSchedule = () => {
            this.schedules.choice().reallocate(Math.random())
            if (Math.random() < 0.6) {
                mutateRandomSchedule()
            }
        }
        mutateRandomSchedule()
        // this.schedules[0].reallocate(0.5)
        // schedules.sort((s1, s2) => s1.score() - s2.score())
        // schedules.slice(0, schedules.randIndex())
        this.solveConflicts()
    }

    printTable() {
        for (let schedule of this.schedules) {
            console.log(schedule.class.code)
            schedule.printTable()
        }
    }

    toJson() {
        let json = {score: this.score()}
        for (let schedule of this.schedules) {
            let code = schedule.class.code
            json[code] = {times: schedule.class.slots, slots: schedule.toJson()}
        }
        // console.dir(json, {depth: 3})
        let data = JSON.stringify(json)
        return data
        // console.log(data)
        // process.exit()
    }
}

module.exports = Allocation