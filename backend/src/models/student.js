const { Schema, model, Types } = require('mongoose');

const studentSchema = new Schema(
  {
    school: { type: Types.ObjectId, ref: 'School', required: true },
    studentCode: { type: String, required: true },
    name: { type: String, required: true },
    className: { type: String, required: true },
    section: { type: String, default: 'A' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    parentContact: String,
    parentEmail: String,
  },
  { timestamps: true }
);

studentSchema.index({ school: 1, studentCode: 1 }, { unique: true });
studentSchema.index({ school: 1, className: 1, section: 1 });

module.exports = model('Student', studentSchema);
