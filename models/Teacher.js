require('../utils')

const { DEFAULT_PREFERENCE_SCORE } = require('../conf')

const preferences = require('../teachers')

class Teacher {
    constructor(name) {
        this.name = name
        this.preferences = this.loadPreferences()
        this.disciplines = new Set()
        this.classes = []
    }

    loadPreferences() {
        if (!preferences[this.name]) {
            return []
        }
        return preferences[this.name]
    }

    getScoreFor(day_index, start_time, end_time) {
        if (!this.preferences[day_index]) {
            return DEFAULT_PREFERENCE_SCORE
        }
        let score = 0
        let prefs = this.preferences[day_index].filter(
            pref =>
                (start_time >= pref.from && start_time <= pref.to) ||
                (end_time >= pref.from && end_time <= pref.to)
        )
        score += prefs.map(pref => pref.score).sum()
        return score
        // process.exit()
    }

    clear() {
        this.disciplines = new Set()
        this.classes = []
    }

    addDiscipline(discipline) {
        this.disciplines.add(discipline)
    }

    addClass(day, slot) {
        let index = day.index
        let discipline = day.slots[slot].discipline
        let from = day.times[slot][0]
        let to = day.times[slot][1]
        this.classes.push({
            index, from, to, discipline
        })
    }

    getWorkingDays() {
        let days = {}
        for (let klass of Object.values(this.classes)) {
            if (!days[klass.index]) {
                days[klass.index] = []
            }
            days[klass.index].push(klass)
        }
        return days
    }
}

module.exports = Teacher