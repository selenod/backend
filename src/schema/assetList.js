import mongoose from 'mongoose';

const { Schema } = mongoose;

const assetListSchema = new Schema({
  id: {
    type: Number,
    required: true,
  },
});

export default mongoose.model('AssetList', assetListSchema);
