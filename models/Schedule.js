require('../utils')


class Day {
    constructor(number_of_slots) {
        this.slots = Array(number_of_slots).fill(null)
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
}

class Schedule {
    constructor(klass, days = 5) {
        let number_of_slots = klass.slots.length

        this.class = klass
        this.days = Array(days).fill(null).map(day => {
            return new Day(number_of_slots)
        })
    }

    allocate(blocks) {
        if (!blocks) {
            blocks = this.class.getDisciplineBlocks()
        }

        blocks.shuffle()

        while(blocks.length > 0) {
            let block = blocks.shift()
            let day = this.findDayFor(block)
            while (day === false) {
                let deallocated = this.deallocate()
                blocks.push(deallocated)
                day = this.findDayFor(block)
            }
            let slot_index = day.findSlotFor(block)
            day.allocate(block, slot_index)
        }
        // process.exit()
    }

    findDayFor(block) {
        let number_of_slots = block.slots
        let discipline_code = block.discipline.code
        let available_days = this.days.map((day, day_index) => {
            return day.isAvailableFor(number_of_slots) && !day.hasDiscipline(discipline_code) ? day : false
        }).filter(day => day !== false)
        if (available_days.length == 0) {
            return false
        }
        return available_days.choice()
    }

    deallocate(day = null, slot = null) {
        while (slot == null || day == null || day.slots[slot] == null) {
            day = this.days.choice()
            slot = day.randomSlot()
        }

        let block = day.deallocate(day.slots[slot].discipline)
        return block
    }

    printTable() {
        let table = []
        for (let day of this.days) {
            let day_table = []
            for (let slot of day.slots) {
                day_table.push(slot)
            }
            day_table = day_table.map(d => d ? d.discipline.code : null)
            table.push(day_table)
        }
        let inverse_table = []
        for (let i = 0; i < table.length; i++) {
            for (let j = 0; j < table[i].length; j++) {
                if (!inverse_table[j]) {
                    inverse_table[j] = []
                }
                inverse_table[j][i] = table[i][j]
            }
        }
        console.table(inverse_table)
    }
}

module.exports = Schedule