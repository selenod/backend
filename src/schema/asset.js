import mongoose from 'mongoose';

const { Schema } = mongoose;

const assetListSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  contents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssetList',
    },
  ],
});

const assetDataSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
    },
    contents: String,
    extension: String,
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('AssetList', assetListSchema);
module.exports = mongoose.model('AssetData', assetDataSchema);
