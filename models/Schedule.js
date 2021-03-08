require('../utils')

const Day = require('./Day')

class Schedule {
    constructor(klass, days = 5) {
        this.class = klass
        this.days = Array(days).fill(null).map((day, index) => {
            return new Day(index, klass.slots)
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

    score() {
        let score = 0
        for (let day of this.days) {
            score += day.score()
        }
        return score
    }

    printTable() {
        let table = []
        for (let day of this.days) {
            let day_table = []
            for (let slot of day.slots) {
                day_table.push(slot)
            }
            day_table = day_table.map((block, index) => block ? block.discipline.tableString(day, index) : null)
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