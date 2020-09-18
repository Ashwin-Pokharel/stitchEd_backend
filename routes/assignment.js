const router = require('express').Router();
const uuid = require('uuid');
const mongoose = require('mongoose')
const Assignment = require('../models/assignment');
const StudentAssignment = require('../models/studentAssignments')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json();
const Teacher = require('../models/teacher')
const Student = require('../models/student');
const user = require('../models/user');


router.post('/student/get_unassigned_assignments' , jsonParser , (req , res)=>{
    if(!req.isAuthenticated()){
      return res.status(403).json({success:false , error:"user is not authenticated"})
    }
    let id = mongoose.Types.ObjectId(req.body.id)
    var assignments = [];
    Student.aggregate([
      {$match : {_id: id}},
      {$unwind: "$assignments"},
    ]).then((array)=>{
      new Promise((resolve , reject) => {
          var counter = 0
          array.forEach(async (assignment)=>{
            counter += 1
            await StudentAssignment.findOne({_id:assignment.assignments, scheduled_flag:false} , (err , doc)=>{
              if(err){
              return res.status(400).json({success:false , error:err})
            }
            if(doc != null){
              assignments.push(doc)
             }
            return;
            })
            if(counter === array.length){
              console.log("resolve")
              resolve();
            }
          })
        }).then(()=>{
          return res.status(200).json({success:true , assignments:assignments})
        }).catch((err)=>{
          return res.status(400).json({success:false , error:err})
        })
    }).catch((err)=>{
      return res.status(400).json({success:false , error:err})
    })
  })
  


router.post('/add_assignment' , jsonParser, (req , res) =>{
  if(!req.isAuthenticated()){ //check to see if user is authenticated
    return res.status(403).json({success:false , error:"user is not authenticated"})
  }
  const name = req.body.name;
  const dueDate = Date(req.body.dueDate);
  const suggestedDate = Date(req.body.suggestedDate);

  const newAssignment = new Assignment({
    name,
    dueDate,
    suggestedDate,
  });

  newAssignment.save((err , doc)=>{
  if(err){
    return res.status(400).json({success:false , error:err})
  }
  var filter = {
    username: req.user.username
  }
  Teacher.findOne(
    filter, (err , teacher)=>{
      if(err){
         return res.status(400).json({success:false , error:err})
      }
      if(teacher){
        teacher.created_assignments.push(doc._id)
        teacher.save((err , teacherdoc) =>{
          if(err){
             return res.status(400).json({success:false , error:err});
          }
          for (let student_id of teacherdoc.students){
            var tempAssignment  = new StudentAssignment({
              assignment_id : doc._id
            })
            tempAssignment.save((err , savedTempAssignment)=>{
              if(err){
                return res.status(400).json({success:false , error:err})
              }
              else{
                if(savedTempAssignment){
                  Student.updateOne({_id:student_id}, {$push: { assignments: savedTempAssignment._id}} , (err, response)=>{
                    if(err){
                      return res.status(400).json({success:false , error:err});
                    };
                  })
                };
              }
            })
          }
          return res.status(200).json({success:true , assignment: doc})
        })
      }
      else{
        return res.status(400).json({success:false , error:"teacher does not exist"})
      }
    })
  })
});


router.post('/get_assignment_info' , jsonParser , (req , res)=>{
  if(!req.isAuthenticated()){
    return res.status(403).json({success:false , error:"user is not authenticated"})
  }
  var assignment_info = {}
  var id = req.body.id
  Assignment.findById(id , (err , document)=>{
    if(err){
      return res.status(400).json({success:false , error:err})
    }
    assignment_info["assignment_details"] = document
  })
  StudentAssignment.countDocuments({assignment_id : id , completion_flag:true} , (err , count)=>{
    if(err){
      return res.status(400).json({success:false , error:err})
    }
    assignment_info["completed"] = count
  })
  StudentAssignment.countDocuments({assignment_id: id , completion_flag:false} , (err , count)=>{
    if(err){
      return res.status(400).json({success:false , error:err})
    }
    assignment_info["incomplete"] = count
  })
  StudentAssignment.find({assignment_id:id , completion_flag:true} , 'hours_worked', (err , document)=>{
    if(err){
      return res.status(400).json({success:false , error:err})
    }
    assignment_info["hours_worked"] = document
    return res.status(200).json(assignment_info)
  })
})


module.exports = router;