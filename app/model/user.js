'use strict';

module.exports = function (app) {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const UserSchema = new Schema(
    {
      name: {
        unique: true,
        type: String,
      },
      password: {
        type: String,
      },
      role: {
        type: String,
        unique: false,
      },
    },
    { versionKey: false }
  );

  return mongoose.model('users', UserSchema);
};
