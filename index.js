require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const PhoneBook = require('./models/PhoneBook')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('post-data', (req) => req.method === 'POST' ? JSON.stringify(req.body) : '')
app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :post-data'))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

const url = process.env.MONGODB_URI
console.log(process.env.MONGODB_URI)
mongoose.connect(url)
  .then((result) => {
    console.log('Connected to MongoDB ', result)
  })
  .catch(err => {
    console.log('error connecting to MongoDB', err.message)
  })

let phonebooks

app.get('/api/persons', (req, res) => {
  PhoneBook.find({})
    .then(result => {
      res.json(result)
      phonebooks = result
    })
    .catch(err => console.log(err))
})

app.get('/api/info', (req, res) => {
  const currentTime = new Date().toString()
  PhoneBook.find({})
    .then(result => {
      console.log(currentTime)
      res.send(`
        <div>
            <div>
                Phonebook has info for ${result.length} people
            </div>
            <div>${currentTime}</div>
        </div>`)
    })
    .catch(err => console.log(err))

})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  console.log(id)
  PhoneBook.findById({ _id: id })
    .then(result => {
      res.json(result)
    })
    .catch(err => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  console.log(id)
  phonebooks = phonebooks.filter(p => p.id !== id)
  PhoneBook.findByIdAndDelete({ _id: id })
    .then((result) => {
      console.log(result)
      res.status(204).end()
    })
    .catch(err => next(err))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  if (!body.name) {
    res.status(400).json({ error: 'name must be given' })
  } else if (phonebooks.find(p => p.name === body.name)) {
    res.status(400).json({ error: 'name must be unique' })
  } else {
    const phonebook = new PhoneBook({
      name: body.name,
      number: body.number,
    })
    phonebook.save()
      .then(result => {
        console.log(result, ' Save success')
        res.json(result)
        phonebooks = phonebooks.concat(phonebook)
      })
      .catch(err => next(err))
  }
})

app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  const body = req.body
  PhoneBook.findByIdAndUpdate({ _id: id }, { number: body.number }, { new: true, runValidators: true, context: 'query' })
    .then(result => {
      console.log(result)
      res.json(result)
    })
    .catch(err => next(err))
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)