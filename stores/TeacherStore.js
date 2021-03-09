const Teacher = require('../models/Teacher')

class TeacherStore {
    constructor() {
        this.teachers = {}
    }

    get(name) {
        if (!this.teachers[name]) {
            this.addTeacher(name)
        }
        return this.teachers[name]
    }

    all() {
        return Object.values(this.teachers)
    }

    addTeacher(name) {
        this.teachers[name] = new Teacher(name)
    }
}

// const instance = new TeacherStore()

module.exports = TeacherStore