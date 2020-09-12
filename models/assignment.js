const mongoose = require('mongoose');
const uuid = require('uuid');

const Schema = mongoose.Schema;

const assignmentSchema = new Schema({
  name: { type: String, required: true },
  dueDate: { type: Date, required: true },
  completionTime: { type: Number, required: true },
  suggestedDate: { type: Date, required: true },
  points: { type: Number, required: true },
  done: { type: Boolean, required: true },
  _id: {type: uuid, required: true},
}, {
  timestamps: true,
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;