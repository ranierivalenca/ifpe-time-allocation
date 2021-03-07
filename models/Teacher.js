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
}

module.exports = Teacher