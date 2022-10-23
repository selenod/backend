import mongoose from 'mongoose';

const { Schema } = mongoose;

const scriptSchema = new Schema(
  {
    data: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    variable: Schema.Types.Mixed,
  },
  {
    versionKey: false,
    minimize: false,
  }
);

export default mongoose.model('Script', scriptSchema);
