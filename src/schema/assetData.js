import mongoose from 'mongoose';

const { Schema } = mongoose;

const assetDataSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    id: {
      type: Number,
      required: true,
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

export default mongoose.model('AssetData', assetDataSchema);
