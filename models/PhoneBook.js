const mongoose = require('mongoose')

const phonebookSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,

  },
  number: {
    type: String,
    validate: {
      validator: function (v) {
        return /^\d{2,3}-\d{1,8}$/.test(v)
      },

    }
  },
})

const PhoneBook = mongoose.model('PhoneBook', phonebookSchema)

module.exports = PhoneBook