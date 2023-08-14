const mongoose = require('mongoose');
const { isEmail} = require('validator');

const EmployeSchema = new  mongoose.Schema({

firstName:{
  type:String,
  required:true,
  lowercase: true,
},
lastName:{
  type:String,
  required:true,
  lowercase: true,
},
Email:{
 type:String,
 required:[true,'Provide an valid email address'],
 lowercase: true,
 unique:[true,'This email is already registerd.'],
 validate:[isEmail,'please eneter a valid Email']
},
telephone:{
type:String,
required:false,
unique:true,
},
workLocation:{
type:mongoose.Types.ObjectId,
ref:'WHouse',
},
Equiptment:{
type:Array
},
HomeAddress:{
type:String,
},
workTelephone:{
type:String,
},
contract:{
type:Object,
},
skills:{
type:Object,
},
DOB:{
type:String,
},
Appraisal:{
type:Array
},
StateOfOringin:{
type:String                    
},
EmaergencyContact:{
type:String
},
NIN:{
type:String
},
BVN:{type:String},
AccountNumber:{type:String},
EmploymentStaus:{type:String},
StartDate:{type:String},
EndDate:{type:String},
EducationalQulification:{type:String},
staffId:{type:String},
role:{
type:String
},
manager:{
type:Object,
},
nextOfKin:{
type:Object
},
Signature:{type:String},
opsCode:{
type:String,
minlength:4,
required:true,
default:"1234"
},
image:{type:String},
Leave:{
type:Array,
},
password:{
  type:String
},
workEmail:{type:String},
Department:{type:String},
coach:{type:String},
unit:{type:String},
Salary:{type:Number},
document:{type:Array},
status:{
  type:String,
  default:'suspended',
},
jobTittle:{
  type:String,
}

})

const  EMPLOYEES = mongoose.model(' EMPLOYEES',EmployeSchema);

module.exports = EMPLOYEES;