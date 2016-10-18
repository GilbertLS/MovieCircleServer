import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const MovieSchema = Schema({
  tmdbId: {type: String, unique: true, required: true},
  data: {type: Object, required: true}
});

export default mongoose.model('Movie', MovieSchema);
