import mongoose from 'mongoose';

const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    createAt: {
      type: Date,
      required: true,
    },
    modifiedAt: {
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
  },
  {
    versionKey: false,
  }
);

export default mongoose.model('Project', projectSchema);
