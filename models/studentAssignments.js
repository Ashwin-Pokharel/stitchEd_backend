const mongoose = require('mongoose')
const schema = mongoose.Schema
const Assignment = require('./assignment').schema


var studentAssignment = new schema({
    assignment :{type:Assignment , default: ()=>({})},
    chosen_due_date : {type:Date , required:false},
    chosen_start_time : {type:Number , reqired:false},
    chosen_end_time : {type:Number , required:false},
    student_points : {type:Number , required:false, default:0},
    hours_worked : {type:Number , require:false , default:0},
    scheduled_flag : {type:Boolean , require:false , default:false},
    completionTime: { type: Date, required: false },
})


module.exports = mongoose.model("StudentAssignment" , studentAssignment)


