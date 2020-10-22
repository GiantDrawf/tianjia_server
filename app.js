'use strict';

const paginate = require('mongoose-paginate-v2');

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  configDidLoad() {
    const mongoose = this.app.mongoose;
    mongoose.plugin(paginate);
  }
}

module.exports = AppBootHook;
