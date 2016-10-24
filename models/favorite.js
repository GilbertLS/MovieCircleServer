import mongoose from 'mongoose';
const Schema   = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const FavoriteSchema = Schema({
  user: {type: ObjectId, require: true, ref: 'User'},
  movie: {type: String, require: true},
  key: {type: String, require: true, unique: true},
});

export default mongoose.model('Favorite', FavoriteSchema);
