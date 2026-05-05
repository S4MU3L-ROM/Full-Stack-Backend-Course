const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

// Database creation
const mongoose = require('mongoose')

if (process.argv.length<3) {
    console.log('give password as argument')
    process.exit(1)
}


const password = process.argv[2]

const url =
    `mongodb+srv://db_phone_directory:${password}@cluster0.5qiogmo.mongodb.net/directory?appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const contactSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Contact = mongoose.model('Contact', contactSchema)


const app = express()

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())


/*morgan.token('body', (request) => {
    if (request.method === 'POST') {
        return JSON.stringify(request.body)
    }

    return ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))*/

let directory = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122"
    }
]

app.get('/info', (request, response) => {
    const phonebook_length = directory.length
    const requestTime = new Date()

    response.send(`
    <p>Phonebook has info for ${phonebook_length} people</p>
    <p>${requestTime}</p>
  `)
})

app.get('/api/persons', (request, response) => {
    Contact.find().then(result => {
        console.log(result[0])
        mongoose.connection.close()
    })
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const phonebook = directory.find(person => person.id === id)

    if (phonebook) {
        response.json(phonebook)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    directory = directory.filter(person => person.id !== id)

    response.status(204).end()
})

const generateId = () => {
    return Math.floor(Math.random() * 1000000)
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const nameExists = directory.some(person => person.name === body.name)

    if (nameExists) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }

    directory = directory.concat(person)

    response.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})