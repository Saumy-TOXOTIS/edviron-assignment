const { Schema, model, Types } = require('mongoose');

const transactionSchema = new Schema(
  {
    school: { type: Types.ObjectId, ref: 'School', required: true },
    student: { type: Types.ObjectId, ref: 'Student', required: true },
    feeBill: { type: Types.ObjectId, ref: 'FeeBill', required: true },
    gatewayRef: { type: String },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    paymentMethod: { type: String, default: 'online' },
    gateway: { type: String, default: 'mock-pay' },
    failureCode: String,
    failureReason: String,
    initiatedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    retryOf: { type: Types.ObjectId, ref: 'Transaction' },
  },
  { timestamps: true }
);

transactionSchema.index({ school: 1, status: 1, createdAt: -1 });
transactionSchema.index({ feeBill: 1 });
transactionSchema.index({ paymentMethod: 1, createdAt: -1 });
transactionSchema.index({ gatewayRef: 1 }, { sparse: true });

module.exports = model('Transaction', transactionSchema);
