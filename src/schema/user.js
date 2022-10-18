import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    translate: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    minimize: false,
  }
);

export default mongoose.model('User', userSchema);
