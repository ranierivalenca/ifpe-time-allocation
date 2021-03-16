require('../utils')

const Day = require('./Day')

class Schedule {
    constructor(klass, days = 5) {
        this._id = Math.random().toString(36).substr(2, 9)

        this.class = klass
        this.days = Array(days).fill(null).map((day, index) => {
            return new Day(index, klass.slots)
        })

        this._score_cache = false
    }

    loadFromJson(json_data) {
        let blocks = this.class.getDisciplinesBlocks()
        for (let day = 0; day < this.days.length; day++) {
            blocks = this.days[day].loadFromJsonWith(json_data.slots[day], blocks)
        }
        if (blocks.length > 0) {
            throw blocks
        }
    }

    allocate(blocks) {
        if (!blocks) {
            blocks = this.class.getDisciplinesBlocks()
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

            // if (block) {
            //     console.log(block, slot_index)
            //     this.printTable()
            // }
            day.allocate(block, slot_index)
            // console.log(block)
            // this.printTable()
            // if (i++ == 10) process.exit()
        }
        // process.exit()
    }

    reallocate(partial = false) {
        if (!partial) {
            // reset days
            this.days = Array(this.days.length).fill(null).map((day, index) => {
                return new Day(index, this.class.slots)
            })
            this.allocate()
        } else {
            let blocks = this.class.getDisciplinesBlocks()
            let deallocated = []
            for (let i = 0; i < +partial * blocks.length; i++) {
                deallocated.push(this.deallocateWorst())
                // console.log(deallocated)
                // this.printTable()
            }
            // process.exit()
            // console.log(deallocated)
            this.allocate(deallocated)
            // this.printTable()
            // process.exit()
        }
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

    deallocateWorst() {
        let days = []
        for (let day of this.days) {
            days.push(day)
        }
        // console.log(days.map(d => d.slotScores()))
        days.sort((d1, d2) => d1.badSlotsSum() - d2.badSlotsSum())
        // console.log(days.map(d => d.slotScores()))
        // process.exit()
        // console.log(days)
        let day = days.shift()
        while (day.worstAllocatedSlot() == -1 && days.length > 0) {
            day = days.shift()
        }
        // console.log(day.worstAllocatedSlot())
        // process.exit()

        return this.deallocate(day, day.worstAllocatedSlot())
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
        if (this._score_cache !== false) {
            return this._score_cache
        }
        let score = 0
        for (let day of this.days) {
            score += day.score()
        }
        this._score_cache = score
        return score
    }

    hasConflictWith(that) {
        if (this.class.endTime() < that.class.startTime() || this.class.startTime() > that.class.endTime()) {
            return false
        }
        for (let i = 0; i < this.days.length; i++) {
            let this_day = this.days[i]
            let that_day = that.days[i]
            if (this_day.hasConflictWith(that_day)) {
                return true
            }
        }
        return false
    }

    resolveConflictsWith(that) {
        let deallocated = []
        for (let i = 0; i < this.days.length; i++) {
            let this_day = this.days[i]
            let that_day = that.days[i]

            let blocks_with_conflict = this_day.getConflictsWith(that_day)
            if (!blocks_with_conflict.length) {
                continue
            }

            let disciplines = new Set()
            blocks_with_conflict.forEach(block => {
                disciplines.add(block.discipline)
            })

            for (let discipline of disciplines) {
                deallocated.push(this_day.deallocate(discipline))
            }
        }
        this.allocate(deallocated)
    }

    updateTeachersClasses() {
        for (let day of this.days) {
            for (let i = 0; i < day.slots.length; i++) {
                let slot = day.slots[i]
                if (!slot) {
                    continue
                }
                for (let teacher of slot.discipline.getTeachers()) {
                    // teacher.name == 'ranieri' ? console.log(teacher) : null
                    teacher.addClass(day, i)
                }
            }
        }
    }

    cloneFrom(schedule) {
        for (let i = 0; i < this.days.length; i++) {
            this.days[i].cloneFromWith(schedule.days[i], this.class)
        }
    }

    printTable() {
        let table = []
        for (let day of this.days) {
            let day_table = []
            for (let slot of day.slots) {
                day_table.push(slot)
            }
            day_table = day_table.map((block, index) => block ? block.discipline.tableString(day, index) + '/' + block.slots : null)
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
        console.log('score: ' + this.score())
        console.table(inverse_table)
    }

    toJson() {
        let table = []
        for (let day of this.days) {
            let day_table = []
            for (let slot of day.slots) {
                day_table.push(slot)
            }
            day_table = day_table.map((block, index) => block ? block.discipline.jsonString(day, index) : null)
            table.push(day_table)
        }
        return table
    }

    nullSlots() {
        return this.days.map(d => d.slots.filter(s => s == null).length).sum()
    }
}

module.exports = Schedule