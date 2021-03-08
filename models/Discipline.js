const Block = require('./Block')

class Discipline {
    constructor(code, blocks) {
        this.code = code
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
    }

    getTeachers() {
        return this.teachers
    }
}

module.exports = Discipline