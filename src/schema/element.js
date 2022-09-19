import mongoose from 'mongoose';

const { Schema } = mongoose;
const elementSchema = new Schema(
  {
    // Unique Data
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

    // Position
    x: {
      type: String,
      required: true,
    },
    y: {
      type: String,
      required: true,
    },
    xAlign: {
      type: Number,
      required: true,
    },
    yAlign: {
      type: Number,
      required: true,
    },
    rotation: {
      type: String,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },

    // Size
    width: String,
    height: String,

    // Text
    text: String,
    fontSize: Number,
    fontWeight: Number,
    color: String,
    backgroundColor: String,
    borderRadius: String,
    borderColor: String,
    part: String,
    src: Number, // asset ID
    canControl: Boolean,
    isChecked: Boolean,
  },
  {
    versionKey: false,
  }
);

export default mongoose.model('Element', elementSchema);
