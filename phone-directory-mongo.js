



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

if (process.argv.length>3) {

    const name = process.argv[3]
    const number = process.argv[4]

    const contact = new Contact({
        name: name,
        number: number,
    })


    contact.save().then(result => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
}

if(process.argv.length<4) {
    Contact.find().then(result => {
        console.log(result[0])
        mongoose.connection.close()
    })
}

