const Block = require('./Block')

class Discipline {
    constructor(code, blocks, course = null) {
        this._id = Math.random().toString(36).substr(2, 9)

        this.code = code
        this.course = course
        this.blocks = this.createBlocks(blocks)
        this.teachers = null
    }

    createBlocks(blocks) {
        let blks = []
        for (let block of blocks) {
            blks.push(new Block(this, block))
        }
        return blks
    }

    setTeachers(teachers) {
        this.teachers = teachers
        teachers.map(teacher => {
            teacher.addDiscipline(this)
        })
    }

    getTeachers() {
        return this.teachers
    }

    tableString(day, slot_index) {
        let score = this.teachers.map(teacher => {
            return teacher.getScoreFor(day.index, day.times[slot_index][0], day.times[slot_index][1])
        }).sum()
        return `[${score}] ${this.code} (${this.teachers.map(t => t.name)})`
    }

    jsonString(day, slot_index) {
        let teachers = this.teachers.map(teacher => {
            return `${teacher.name}:${teacher.getScoreFor(day.index, day.times[slot_index][0], day.times[slot_index][1])}`
        })
        return `${this.code}/${teachers.join(',')}`
    }
}

module.exports = Discipline