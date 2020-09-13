const mongoose = require('mongoose')
const schema = mongoose.Schema
const uuid = require('uuid')
const baseUser = require('./user')
const Assignment = require('./assignment').schema
const Student = require('./student').schema


var extendedTeacherSchema = new schema({
    students: [{type: schema.Types.ObjectId , ref: 'Student'}], 
    created_assignments : [{type:String, ref: 'Assignment'}],
    join_code : {type:String, required:true , unique:true}
})

var teacherSchema  = baseUser.discriminator('Teacher' , extendedTeacherSchema);

module.exports = mongoose.model("Teacher" , teacherSchema.schema)