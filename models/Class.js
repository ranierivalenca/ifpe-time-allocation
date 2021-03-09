const classes = require('../classes')

const { WARNINGS } = require('../conf')

const Course = require('./Course')
const TeacherStore = require('../stores/TeacherStore')

class Class {
    constructor(code, teacherStore = false) {
        if (!classes[code]) {
            throw `Class ${code} not found`
        }

        let klass = classes[code]

        this.teacherStore = teacherStore ? teacherStore : new TeacherStore()

        this.code = code
        this.semester = klass.semester
        this.shift = klass.shift
        this.course = new Course(klass.course_code)
        this.disciplines = this.loadDisciplines()
        this.slots = this.loadSlots()
    }

    loadDisciplines() {
        let all_disciplines = this.course.getDisciplines(this.semester)
        let disciplines = []
        let disc_teachers = classes[this.code].teachers
        for (let discipline of all_disciplines) {
            let teachers = disc_teachers[discipline.code]
            if (!teachers) {
                // console.warn(`Discipline ${discipline.code} in class ${this.code} has no teacher`)
                if (WARNINGS) {
                    console.warn(`Class ${this.code}: discipline ${discipline.code} has no teacher`)
                }
                continue
            }
            teachers = Array.isArray(teachers) ? teachers : [teachers]
            discipline.setTeachers(
                teachers.map(teacher => this.teacherStore.get(teacher))
            )
            disciplines.push(discipline)
        }
        return disciplines
    }

    loadSlots() {
        let slots = []
        return this.course.getSlots(this.shift)
    }

    getDisciplinesBlocks() {
        let blocks = []
        for (let discipline of this.disciplines) {
            blocks.push(...discipline.blocks)
        }
        return blocks
    }

    getDisciplineBlocks(code) {
        // console.log(code, this.disciplines.find(d => d.code == code))
        // console.log(this.disciplines.find(d => d.code == code).blocks)
        return this.disciplines.find(d => d.code == code).blocks

    }

    startTime() {
        return this.slots[0][0]
    }

    endTime() {
        return this.slots[0][this.slots[0].length]
    }
}

module.exports = Class