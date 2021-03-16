const Allocation = require('./models/Allocation')

const fs = require('fs')

let generations = 20000;
let children_per_generation = 30;

let individual = process.argv[2] ?? false
if (individual === false) {
    console.log('Informe o índice do indivíduo!')
    process.exit()
}

let allocation = null
try {
    allocation = new Allocation().loadFromJsonFile(`allocations/${individual}.json`)
    allocation.solveConflicts()
} catch(e) {
    console.log(e)
    allocation = new Allocation().allocate()
}
console.log(`score: ${allocation.score()}`)
// process.exit()
for (generation = 1; generation <= generations; generation++) {
    // console.log(`Generation #${generation}`)

    if (generation % 10 == 0) {
        console.log(`Individual ${individual}, generation #${generation}, score: ${allocation.score()}`)
        fs.writeFileSync(
            `allocations/${individual}.json`,
            allocation.toJson(),
            (err) => {
                console.log('oi')
            }
        )
    }

    let children = [allocation]
    for (let child = 0; child < children_per_generation; child++) {
        children.push(allocation.clone(true))
        children.sort((a1, a2) => a2.score() - a1.score())
    }
    // console.log(children.map(c => c.score()))
    allocation = children[0]
}

console.log(`Individual ${individual} score: ${allocation.score()}`)
fs.writeFile(`allocations/${individual}.json`, allocation.toJson(), () => {})
