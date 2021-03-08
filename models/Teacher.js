require('../utils')

const { DEFAULT_PREFERENCE_SCORE } = require('../conf')

const preferences = require('../teachers')

class Teacher {
    constructor(name) {
        this.name = name
        this.preferences = this.loadPreferences()
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
}

module.exports = Teacher