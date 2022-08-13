import mongoose from 'mongoose';

const { Schema } = mongoose;

const projectSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  description: String,
  ownerUID: {
    type: String,
    required: true,
  },
  createAt: {
    type: Date,
    required: true,
  },
  windowList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Window',
    },
  ],
  assetList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Window',
    },
  ],
});

module.exports = mongoose.model('Project', projectSchema);
