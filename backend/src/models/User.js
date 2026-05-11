const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'externo'], required: true },
    refreshTokens: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);