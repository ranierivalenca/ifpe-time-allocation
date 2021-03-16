const express = require('express')
const fs = require('fs')

const app = express()
app.use('/allocations', express.static('../allocations'))

app.get('/', (req, res) => {
    fs.readFile('view.html', 'utf-8', (err, data) => {
        res.send(data)
    })
})

app.get('/available-allocations', (req, res) => {
    let files_list = {}
    fs.readdir('../allocations', (err, files) => {
        files.forEach(file => {
            try {
                files_list[file] = JSON.parse(fs.readFileSync(`../allocations/${file}`)).score
            } catch(e) {
            }
        })
        // files_list.sort((f1, f2) => +f1 - +f2)
        let keys = Object.keys(files_list).sort((f1, f2) => +f1.split('.')[0] - +f2.split('.')[0])
        let final_list = {}
        for (let key of keys) {
            final_list[key] = files_list[key]
        }
        console.log(final_list)
        res.send(final_list)
    })
})

app.listen(3000)