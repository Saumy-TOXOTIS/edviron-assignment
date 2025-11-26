const { Schema, model, Types } = require('mongoose');

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: Types.ObjectId, ref: 'Role', required: true },
    school: { type: Types.ObjectId, ref: 'School' },
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = model('User', userSchema);
