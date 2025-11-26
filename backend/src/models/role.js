const { Schema, model } = require('mongoose');

const roleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    scope: { type: String, enum: ['global', 'school'], default: 'school' },
    permissions: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = model('Role', roleSchema);
