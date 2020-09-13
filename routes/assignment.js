const router = require('express').Router();
const uuid = require('uuid');
const Assignment = require('../models/assignment');
const StudentAssignment = require('../models/studentAssignments')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json();
const Teacher = require('../models/teacher')
const Student = require('../models/student')

router.get('/all_assignments' , jsonParser, function(req , res){
    Assignment.find()
    .then(assignments => res.json(assignments))
    .catch(err => res.status(400).json('Error: ' + err));
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
        return res.status(400).json({success:false , error:err})
      }
      if(teacher != null){
        teacher.created_assignments.push(doc._id)
        teacher.save((err , teacherdoc) =>{
          if(err){
            return res.status(400).json({success:false , error:err});
          }
          for (let student_id of teacherdoc.students){
            var tempAssignment  = new StudentAssignment({
              assignment : doc
            })
            Student.findById(student_id , (err , student) =>{
              if(err){
                return res.status(400).json({success:false , error:err});
              }
              student.assignments.push(tempAssignment)
              student.save((err , studentDoc) =>{
                if(err){
                  return res.status(400).json({success:false , error:err});
                }
                return
              })
              return
            })
          };
          return res.status(200).json({success:true , assignment: doc});
      })
      }
      else{
        return res.status(400).json({success:false})
      }
    })
  })
});
/*
router.put('/update/' , jsonParser, function(req , res){
    const name = req.body.name;
    const dueDate = Date.parse(req.body.dueDate);
    const suggestedDate = Date.parse(req.body.suggestedDate);
    const _id = req.body._id;

    const updatedAssignment = new Assignment({
        name,
        dueDate,
        suggestedDate,
        _id,
      });

    Assignment.findByIdAndUpdate(_id, updatedAssignment)
    .then(() => res.json('Assignment updated!'))
    .catch(err => res.status(400).json('Error: ' + err));
});
*/

module.exports = router;