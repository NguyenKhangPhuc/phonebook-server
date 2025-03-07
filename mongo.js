const mongoose = require('mongoose')
const PhoneBook = require('./models/PhoneBook')
if (process.argv.length < 3) {
  console.log('Give password')
  process.exit(1)
}
const password = process.argv[2]
const url = `mongodb+srv://nkpnkpnkp2005:${password}@cluster0.aeakj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

if (process.argv.length === 3) {
  PhoneBook.find({})
    .then(result => {
      result.forEach((p) => {
        console.log(p)
        mongoose.connection.close()
      })
    })
    .catch(err => { console.log(err) })
}

const phonebook = new PhoneBook({
  name: process.argv[3],
  number: process.argv[4]
})

phonebook.save()
  .then(res => {
    console.log(res, ' Saved')
    mongoose.connection.close()
  })
  .catch(err => console.log(err))