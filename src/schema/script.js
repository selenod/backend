import mongoose from 'mongoose';

const { Schema } = mongoose;

const scriptSchema = new Schema(
  {
    data: {
      type: Map,
      of: {
        nodeId: {
          type: String,
        },
        inputConnections: Schema.Types.Mixed,
        outputFlowConnection: Schema.Types.Mixed,
        position: {
          x: {
            type: Number,
          },
          y: {
            type: Number,
          },
        },
        zIndex: {
          type: Number,
        },
      },
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model('Script', scriptSchema);
