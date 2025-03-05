const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('post-data', (req) => req.method == 'POST' ? JSON.stringify(req.body) : '')
app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :post-data'))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

let phonebooks = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get("/api/persons", (req, res) => {
    res.json(phonebooks)
})

app.get("/info", (req, res) => {
    const currentTime = new Date().toString();
    console.log(currentTime)
    res.send(`
        <div>
            <div>
                Phonebook has info for ${phonebooks.length} people
            </div>
            <div>${currentTime}</div>
        </div>`)


})

app.get("/api/persons/:id", (req, res) => {
    const id = req.params.id
    console.log(id)
    const phonebook = phonebooks.find(p => p.id == id)
    if (phonebook) {
        res.json(phonebook)
    } else {
        res.status(404).end()
    }
})

app.delete("/api/persons/:id", (req, res) => {
    const id = req.params.id
    phonebooks = phonebooks.filter(p => p.id != id)
    res.status(204).end()
})

app.post("/api/persons/", (req, res) => {
    const body = req.body
    if (!body.name) {
        res.status(400).json({ error: 'name must be given' })
    } else if (phonebooks.find(p => p.name == body.name)) {
        res.status(400).json({ error: "name must be unique" })
    } else {
        const phonebook = {
            name: body.name,
            number: body.number,
            id: body.id || String(Math.floor(Math.random() * 100000 + 10))
        }
        phonebooks = phonebooks.concat(phonebook)
        res.json(phonebook)
    }
})
