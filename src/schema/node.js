import mongoose from 'mongoose';

const { Schema } = mongoose;

const nodeSchema = new Schema(
  {
    type: Map,
    of: {
      nodeId: {
        type: String,
        required: true,
      },
      outputFlowConnection: {
        id: {
          type: String,
          required: true,
        },
        pinType: Number,
        name: String,
      },
      inputConnections: [
        {
          name: {
            type: String,
            required: true,
          },
          connection: {
            id: {
              type: String,
              required: true,
            },
            pinType: Number,
            name: String,
          },
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
  },
  {
    versionKey: false,
  }
);

export default mongoose.model('Node', nodeSchema);
