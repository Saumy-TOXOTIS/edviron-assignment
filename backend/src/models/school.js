const { Schema, model } = require('mongoose');

const schoolSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    address: String,
    timezone: { type: String, default: 'Asia/Kolkata' },
  },
  { timestamps: true }
);

module.exports = model('School', schoolSchema);
