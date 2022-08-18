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
  lastModifiedAt: {
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
      ref: 'AssetList',
    },
  ],
  assetData: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssetData',
    },
  ],
  assetLength: {
    type: Number,
    required: true,
  },
});

export default mongoose.model('Project', projectSchema);
