const classes = require('../classes')

const Course = require('./Course')
const TeacherStore = require('../stores/TeacherStore')

class Class {
    constructor(code) {
        if (!classes[code]) {
            throw `Class ${code} not found`
        }

        let klass = classes[code]

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
                console.warn(`Discipline ${discipline.code} in course ${this.course.code} has no teacher`)
                continue
            }
            teachers = Array.isArray(teachers) ? teachers : [teachers]
            discipline.setTeachers(
                teachers.map(teacher => TeacherStore.get(teacher))
            )
            disciplines.push(discipline)
        }
        return disciplines
    }

    loadSlots() {
        let slots = []
        return this.course.getSlots(this.shift)
    }
}

module.exports = Class