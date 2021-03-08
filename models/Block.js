class Block {
    constructor(discipline, slots) {
        this.discipline = discipline
        this.slots = slots
    }

    getTeachers() {
        return this.discipline.getTeachers()
    }
}

module.exports = Block