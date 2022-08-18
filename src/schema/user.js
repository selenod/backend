import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  uid: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.model('User', userSchema);
