import mongoose from 'mongoose';

const { Schema } = mongoose;

const nodeSchema = new Schema({
  type: Map,
  of: {
    nodeId: {
      type: String,
      required: true,
    },
    outputFlowConnection: PinData,
    inputConnections: [
      {
        name: {
          type: String,
          required: true,
        },
        connection: PinData,
      },
    ],
    position: {
      x: {
        type: Number,
        required: true,
      },
      y: {
        type: Number,
        required: true,
      },
    },
    zIndex: {
      type: Number,
      required: true,
    },
  },
});

module.exports = mongoose.model('Node', nodeSchema);
