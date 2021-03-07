class Discipline {
    constructor(code, blocks) {
        this.code = code
        this.blocks = blocks
        this.teachers = null
    }

    setTeachers(teachers) {
        this.teachers = teachers
    }
}

module.exports = Discipline