import mongoose from 'mongoose';
const Schema   = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const WatchedSchema = Schema({
  user: {type: ObjectId, require: true},
  movie: {type: String, require: true},
});

export default mongoose.model('Watched', WatchedSchema);
