const mongoose = require('mongoose')
const schema = mongoose.Schema
const baseUser = require('./user')
const Assignment = require('./assignment').schema
const StudentAssignment = require('./studentAssignments').schema


var extendedStudentSchema = new schema({
    assignments: [StudentAssignment],
    total_points: {type:Number , default:0}
}) 

var studentSchema = baseUser.discriminator('Student' , extendedStudentSchema)

module.exports = mongoose.model("Student" , studentSchema.schema)