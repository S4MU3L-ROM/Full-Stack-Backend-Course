require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const password = encodeURIComponent(process.env.MONGO_PASSWORD)
const url = `mongodb+srv://db_full_stack:${password}@cluster0.5qiogmo.mongodb.net/directory?appName=Cluster0`

mongoose.connect(url)
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

const contactSchema = new mongoose.Schema({
    name: {
        type:String,
        minlength: 3,
        required:true,
        trim: true
    },
    number: {
        type:String,
        minlength:3,
        required:true,
        trim: true
    }
})

contactSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject.__v
        delete returnedObject._id
    }
})

const Contact = mongoose.model('Contact', contactSchema)

const app = express()

app.use(express.json())
app.use(express.static('dist'))
app.use(morgan('tiny'))
app.use(cors())

app.get('/info', (request, response, next) => {
    Contact.countDocuments({})
        .then(count => {
            const requestTime = new Date()

            response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${requestTime}</p>
      `)
        })
        .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
    Contact.find({})
        .then(persons => {
            response.json(persons)
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Contact.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).json({
                    error: 'contact not found'
                })
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Contact.findByIdAndDelete(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
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

    Contact.findOne({ name: body.name })
        .then(existingContact => {
            if (existingContact) {
                return response.status(400).json({
                    error: 'name must be unique'
                })
            }

            const contact = new Contact({
                name: body.name,
                number: body.number,
            })

            return contact.save()
                .then(savedContact => {
                    console.log(`added ${body.name} number ${body.number} to phonebook`)
                    response.status(201).json(savedContact)
                })
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const contact = {
        name: body.name,
        number: body.number,
    }

    Contact.findByIdAndUpdate(
        request.params.id,
        contact,
        {
            new: true,
            runValidators: true,
            context: 'query'
        }
    )
        .then(updatedContact => {
            response.json(updatedContact)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({
        error: 'unknown endpoint'
    })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({
            error: 'malformatted id'
        })
    }

    if (error.name === 'ValidationError') {
        return response.status(400).json({
            error: error.message
        })
    }

    next(error)
}

app.use(unknownEndpoint)
app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})