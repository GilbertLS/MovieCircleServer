import mongoose from 'mongoose';
const Schema   = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const WatchLaterSchema = Schema({
  _user: {type: ObjectId, require: true, ref: 'User'},
  _movie: {type: ObjectId, require: true, ref: 'Movie'},
  tmdbId: {type: String, require: true},
  key: {type: String, require: true, unique: true},
});

export default mongoose.model('WatchLater', WatchLaterSchema);
