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
        console.log(files_list)
        res.send(files_list)
    })
})

app.listen(3000)