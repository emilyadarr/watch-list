const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

// import schemas
const bookSchema = require('./Book');
const tvSchema = require('./TV');
const movieSchema = require('./Movie');

const userSchema = new Schema (
  {
    username: {
      type: String, 
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    // set savedBooks, savedTV and savedMovies to be an array of data that adheres to the schemas
    savedBooks: [bookSchema],
    savedTV: [tvSchema],
    savedMovies: [movieSchema],
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

// hash user password
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// method to compare and validate password for loggin in
userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// when we query a user, we'll also get fields with number of books, movies and shows
userSchema.virtual('bookCount').get(function () {
  return this.savedBooks.length;
});

userSchema.virtual('tvCount').get(function () {
  return this.savedTV.length;
});

userSchema.virtual('movieCount').get(function () {
  return this.savedMovies.length;
});

const User = model('User', userSchema);

module.exports = User;