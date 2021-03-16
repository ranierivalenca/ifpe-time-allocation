const { DEFAULT_PREFERENCE_SCORE } = require('../conf')

class Day {
    constructor(index, slots) {
        this._id = Math.random().toString(36).substr(2, 9)

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

    loadFromJsonWith(json_day, blocks) {
        let allocate = (json_block, i_now) => {
            if (!json_block['disc']) {
                return
            }
            // console.log(json_block)
            let block_index = blocks.findIndex(b => b.discipline.code == json_block.disc && b.slots == json_block.slots)
            if (block_index == -1) {
                // console.error(blocks)
                return
            }
            let block = blocks[block_index]
            blocks = [...blocks.slice(0, block_index), ...blocks.slice(block_index + 1)]
            this.allocate(block, i_now - json_block.slots)
        }
        let json_blk = {}
        let i = 0
        let null_streak = 0
        for (i = 0; i < json_day.length; i++) {
            let json_slot = json_day[i]
            if (json_slot == null) {
                if (null_streak++ == 0) {
                    allocate(json_blk, i)
                    json_blk = {}
                }
                continue
            }
            null_streak = 0
            json_slot = json_slot.split('/')[0]
            if (json_blk['disc'] == json_slot) {
                json_blk['slots']++
            } else {
                allocate(json_blk, i)
                json_blk = {'disc': json_slot, 'slots': 1}
            }
        }
        if (null_streak == 0) {
          allocate(json_blk, i)
        }

        return blocks
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
        let score = 0
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

    slotScores() {
        let scores = Array(this.slots.length).fill(null)
        for (let i = 0; i < this.slots.length; i++) {
            let slot = this.slots[i]
            let times = this.times[i]
            if (slot) {
                let teachers = slot.discipline.getTeachers()
                for (let teacher of teachers) {
                    scores[i] = teacher.getScoreFor(this.index, times[0], times[1])
                }
            }
        }
        return scores
    }

    badSlotsSum() {
        let scores = this.slotScores().filter(s => s != null && s <= DEFAULT_PREFERENCE_SCORE)
        if (scores.length == 0) {
            return Infinity
        }
        return scores.sum()
    }

    worstAllocatedSlot() {
        let worstSlot = -1
        let worstScore = Infinity

        for (let i = 0; i < this.slots.length; i++) {
            let slot = this.slots[i]
            let times = this.times[i]
            if (slot) {
                let teachers = slot.discipline.getTeachers()
                let score = 0
                for (let teacher of teachers) {
                    score += teacher.getScoreFor(this.index, times[0], times[1])
                }
                if (score < worstScore) {
                    worstScore = score
                    worstSlot = i
                }
            }
        }
        return worstSlot
    }

    hasConflictWith(that) {
        // for (let i = 0; i < this.slots.length; i++) {
        //     for (let j = 0; j < that.slots.length; j++) {
        //         let this_time = this.times[i]
        //         let that_time = that.times[j]
        //         if (this_time[0] > that_time[1] || this_time[1] < that_time[0]) {
        //             continue
        //         }
        //         let this_disc = this.slots[i]?.discipline
        //         let that_disc = that.slots[j]?.discipline
        //         if (this_disc && that_disc) {
        //             let this_teachers = this_disc.getTeachers()
        //             let that_teachers = that_disc.getTeachers()
        //             if (this_teachers.filter(t => that_teachers.includes(t)).length) {
        //                 return true
        //             }
        //         }
        //     }
        // }
        // return false
        if (this.getConflictsWith(that, true).length) {
            return true
        }
        return false
    }

    getConflictsWith(that, stop_on_first = false) {
        let intersectTime = (this_slot, that_slot) => {
            let this_time = this.times[this_slot]
            let that_time = that.times[that_slot]
            if (this_time[0] >= that_time[1] || this_time[1] <= that_time[0]) {
                return false
            }
            return true
        }
        let getTeachersOnSlot = (day, slot_index) => {
            let discipline = day.slots[slot_index]?.discipline
            if (!discipline) {
                return []
            }
            return discipline.getTeachers()
        }
        let blocks = []
        for (let i = 0; i < this.slots.length; i++) {
            for (let j = 0; j < that.slots.length; j++) {
                if (!intersectTime(i, j)) {
                    continue
                }

                let this_teachers = getTeachersOnSlot(this, i)
                let that_teachers = getTeachersOnSlot(that, j)
                if (this_teachers.filter(t => that_teachers.map(t => t.name).includes(t.name)).length) {
                    // console.log(this, this_teachers, that, that_teachers)
                    if (stop_on_first) {
                        return [this.slots[i]]
                    }
                    blocks.push(this.slots[i])
                }
            }
        }
        return blocks
    }

    cloneFromWith(day, klass) {
        for (let i = 0; i < this.slots.length; i++) {
            let slot = day.slots[i]
            if (slot) {
                // console.log(day.slots[i].discipline.getTeachers().map(t => t.name + ',' + t._id))
                this.slots[i] = klass.getDisciplineBlocks(slot.discipline.code).find(b => b.slots == slot.slots)
                // console.log(this.slots[i].discipline.getTeachers().map(t => t.name + ',' + t._id))
            }
        }
    }
}

module.exports = Day