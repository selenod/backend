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
        inputConnections: [
          {
            name: {
              type: String,
            },
            connection: {
              id: {
                type: String,
              },
              pinType: Number,
              name: String,
            },
          },
        ],
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
