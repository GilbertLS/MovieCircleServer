import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSchema = Schema({
  facebookId: {type: String, required: true, unique: true},
  accessToken: {type: Object, required: true},
  friends: {type: Array}
});

export default mongoose.model('User', UserSchema);
