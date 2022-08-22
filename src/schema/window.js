import mongoose from 'mongoose';

const { Schema } = mongoose;

const windowSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
  windowData: {
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
  },
  nodeData: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Node',
    },
  ],
  elementData: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Element',
    },
  ],
});

export default mongoose.model('Window', windowSchema);
