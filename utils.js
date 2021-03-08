// random integer in interval [s, e)
let intRnd = (s, e) => {
    [s, e] = e ? [s, e] : [0, s]
    return s + (Math.floor(Math.random() * (e - s)) % (e - s))
}


Array.prototype.shuffle = function(n=0.5) {
    for (let i = 0; i < this.length * n; i++) {
        let i1 = intRnd(this.length);
        let i2 = intRnd(this.length);

        let tmp = this[i1];
        this[i1] = this[i2];
        this[i2] = tmp;
    }
}

Array.prototype.choice = function(pop = false) {
    let i = intRnd(this.length)
    let el = this[i]
    if (pop) {
        let tmp = this[0];
        this[0] = this[i];
        this[i] = tmp;
        this.shift()
    }
    return el
}

Array.prototype.randIndex = function() {
    return intRnd(this.length)
}