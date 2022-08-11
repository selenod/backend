const mongoose = require('mongoose');
const { Schema } = mongoose;

const projectSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  description: String,
  ownerUID: Number,
  windowList: [
    {
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
      scriptData: [],
      elementData: [
        {
          // Unique Data
          name: {
            type: String,
            required: true,
          },
          id: {
            type: Number,
            required: true,
            unique: true,
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
          placeholder: String,
          fontSize: Number,
          color: String,
          backgroundColor: String,
          borderRadius: String,
          borderColor: String,
          part: String,
          src: Number, // asset ID
          canControl: Boolean,
          isChecked: Boolean,
        },
      ],
    },
  ],
});

module.exports = mongoose.model('project', projectSchema);
