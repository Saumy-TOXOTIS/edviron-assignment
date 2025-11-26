const { Schema, model, Types } = require('mongoose');

const feeBillSchema = new Schema(
  {
    school: { type: Types.ObjectId, ref: 'School', required: true },
    student: { type: Types.ObjectId, ref: 'Student', required: true },
    billNo: { type: String, required: true },
    dueDate: { type: Date, required: true },
    className: { type: String },
    section: { type: String },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['due', 'partial', 'paid', 'overdue'],
      default: 'due',
    },
    paymentMethod: { type: String, default: 'online' },
  },
  { timestamps: true }
);

feeBillSchema.index({ school: 1, status: 1, dueDate: 1 });
feeBillSchema.index({ student: 1 });
feeBillSchema.index({ school: 1, billNo: 1 }, { unique: true });
feeBillSchema.index({ school: 1, className: 1, section: 1 });

module.exports = model('FeeBill', feeBillSchema);
