import mongoose from 'mongoose';

const { Schema } = mongoose;

const windowSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  windowData: {
    width: Number,
    height: Number,
    resizable: Boolean,
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
