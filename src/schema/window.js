import mongoose from 'mongoose';

const { Schema } = mongoose;

const windowSchema = new Schema(
  {
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
    scriptData: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Script',
    },
    elementData: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Element',
      },
    ],
  },
  {
    versionKey: false,
  }
);

export default mongoose.model('Window', windowSchema);
