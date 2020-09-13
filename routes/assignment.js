const router = require('express').Router();
const uuid = require('uuid');
const Assignment = require('../models/assignment');
const StudentAssignment = require('../models/studentAssignments')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json();
const Teacher = require('../models/teacher')
const Student = require('../models/student');
const user = require('../models/user');

router.get('/student/get_unassigned_assignments' , jsonParser, (req , res)=>{
    if(!req.isAuthenticated()){
      return res.status(403).json({success:false , error:"user is not authenticated"})
    }
    var filter = {
      username : req.user.username
    }
    Student.exists(filter).then(exist =>{
      if(!exist){
        return res.status(400).json({success:false , error:"student does not exist"})
      }
    });
    Student.find(filter , {assignments: {$elemMatch : {"scheduled_flag":false}}} , (err , docs)=>{
      if(err){
        return res.status(400).json({success:false , error:err})
      }
      console.log(docs)
      return res.status(200).json({success:true , assignments:docs})
    })
});


router.post('/add_assignment' , jsonParser, (req , res) =>{
  if(!req.isAuthenticated()){ //check to see if user is authenticated
    return res.status(403).json({success:false , error:"user is not authenticated"})
  }
  const name = req.body.name;
  const dueDate = Date(req.body.dueDate);
  const suggestedDate = Date(req.body.suggestedDate);
  const _id = uuid.v4();

  const newAssignment = new Assignment({
    name,
    dueDate,
    suggestedDate,
    _id,
  });

  newAssignment.save((err , doc)=>{
  if(err){
    return res.status(400).json()
  }
  var filter = {
    username: req.user.username
  }
  Teacher.findOne(
    filter, (err , teacher)=>{
      if(err){
         res.status(400).json({success:false , error:err})
      }
      if(teacher != null){
        teacher.created_assignments.push(doc._id)
        teacher.save((err , teacherdoc) =>{
          if(err){
             res.status(400).json({success:false , error:err});
          }
          for (let student_id of teacherdoc.students){
            var tempAssignment  = new StudentAssignment({
              assignment : doc._id
            })
            Student.findById(student_id , (err , student) =>{
              if(err){
                res.status(400).json({success:false , error:err});
              }
              else{
                student.assignments.push(tempAssignment)
                student.save((err , studentDoc) =>{
                  if(err){
                    res.status(400).json({success:false , error:err});
                  }
                  return;
                })
                return;
              }
            })
          };
          return res.status(200).json({success:true , assignment: doc});
      })
      }
      else{
        return res.status(400).json({success:false})
      }
    })
    return res 
  })
});

router.post('/update_points' ,jsonParser ,(req , res)=>{
    if(!req.isAuthenticated()){
      return res.status(403).json({success:false , error:"user is not authenticated"})
    }
    var id = req.body.id
    var points = req.body.points
    var filter = {
      username : req.user.username,
      "assignemnts._id": id
    }
    Student.findOneAndUpdate(filter,
      {$set: {"assignments.$.student_points":points}},
      (err , doc)=>{
        if(err){
          return res.status(400).json({success:false})
        }
        else{
          return res.status(200).json({success:true , assignment: doc});
        }
    })
  }
)

router.post('/get_assignment_info' , jsonParser , (req , res)=>{
  var return_dict = {
    complete:0,
    incomplete:0,
    hours_spent:[

    ]
  }
  var assignment_id = req.body.id

  if(!req.isAuthenticated()){
    return res.status(403).json({success:false , error:"user is not authenticated"})
  }
  Teacher.findOne({username:req.user.username}, (err , teacher)=>{
    if(err){
      return res.status(400).json({success:false , error :err})
    }

    for(let students of teacher.students){
      Student.findById(students._id , (err , student)=>{
        if(err){
          return res.status(400).json({success:false , error :err})
        }
        assignments = student.assignments
        for(let assignment of assignments){
          if(assignment._id == assignment_id){
            if(assignment.completion_flag){
              return_dict.complete += 1;
              return_dict.hours_spent.push(assignment.hours_worked)
            }
            else{
              return_dict.incomplete += 1;
            }
            break;
          }
        }
      })
    }
    return res.status(200).json({success:true , assignment_info:return_dict})
    
  })
})


module.exports = router;