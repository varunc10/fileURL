const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  shortLink: String,
  fileName: String,
  fileType: String,
  username: String, 
});

const File = mongoose.model('File', fileSchema);

module.exports = File;