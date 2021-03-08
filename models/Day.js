class Day {
    constructor(index, slots) {
        let number_of_slots = slots.length

        this.index = index
        this.slots = Array(number_of_slots).fill(null)
        this.times = slots
    }

    isAvailableFor(number_of_slots) {
        let cont = 0
        for (let slot of this.slots) {
            if (slot == null) {
                cont++
            } else {
                cont = 0
            }
            if (cont >= number_of_slots) {
                return true
            }
        }
        return false
    }

    hasDiscipline(discipline_code) {
        for (let slot of this.slots) {
            if (slot?.discipline.code == discipline_code) {
                return true
            }
        }
        return false
    }

    randomSlot() {
        return this.slots.randIndex()
    }

    allocate(block, starter_slot) {
        // console.log(block)
        for (let i = 0; i < block.slots; i++) {
            this.slots[starter_slot + i] = block
        }
    }

    deallocate(discipline) {
        let block = null
        for (let index = 0; index < this.slots.length; index++) {
            let slot = this.slots[index]
            if (slot?.discipline.code == discipline.code) {
                block = slot
                this.slots[index] = null
            }
        }
        return block
    }

    findSlotFor(block, random = true) {
        let cont = 0
        let number_of_slots = block.slots

        let indexes = []
        for (let index = 0; index < this.slots.length; index++) {
            let slot = this.slots[index]
            if (slot == null) {
                cont++
            } else {
                cont = 0
            }
            if (cont >= number_of_slots) {
                if (!random) {
                    return index
                }
                indexes.push(index - number_of_slots + 1)
            }
        }
        if (indexes.length) {
            return indexes.choice()
        }
        return false
    }

    score() {
        let score = 0;
        for (let i = 0; i < this.slots.length; i++) {
            let slot = this.slots[i]
            let times = this.times[i]
            if (slot) {
                let teachers = slot.discipline.getTeachers()
                for (let teacher of teachers) {
                    score += teacher.getScoreFor(this.index, times[0], times[1])
                }
            }
        }
        return score
    }
}

module.exports = Day