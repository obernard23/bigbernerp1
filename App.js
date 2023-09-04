const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const authRoutes = require("./Routes/authenticate");
const cookieParser = require("cookie-parser");
const { requireAuth, checkUser } = require("./middleware/authmidddleware");
const Dotenv = require("./.env");
const { WHouse } = require("./modules/warehouse");
const Employe = require('./modules/Employees')
const nodemailer = require("nodemailer");
const {PASSWORD,EMAIL,ERPSmtpName} = require('./.env');
const birthdayTemplates = require('./EmailTemplates/birthdatTemplate')

//initialize app
const app = express();

mongoose.set("strictQuery", true);
mongoose
  .connect(Dotenv.dbUrl, { useNewUrlParser: true })
  .then((result) => {
    app.listen(Dotenv.PORT, () => {
      console.log(`connected to ${Dotenv.PORT}`);
    }),
    console.log("connected to db");
  })
  .catch((err) => console.log(err));

//register view engine
app.set("view engine", "ejs");

//for middle ware
app.use(express.static("public"));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
//declare public folder
app.set("public");

//router for routes
app.use(authRoutes);

//entrty routes for server
app.get("/", async (req, res, next) => {
  //check and CREATE ADMIN 
  
      res.redirect("/Dashboard/userid");
});



 // for birthdat notifications

 async function sendBirtdaysEmail( ){
  
  // send  birthday mail automatically
  const data = await Employe.find({DOB:`${new Date().getDate()}/${+new Date().getMonth() + 1}`})


let config = {
    service : 'gmail',
    auth : {
        user: EMAIL,
        pass: PASSWORD
    },
    tls : { rejectUnauthorized: false }//always add this to stop error in console   
}

let transporter = nodemailer.createTransport(config);


  //send mail to each email
     data.forEach((person) => {
      if(person){
        let message = {
          from : EMAIL,
          to : person.Email,//employee email
          subject: `Happy Birthday ${person.firstName} `,
          html: birthdayTemplates(person)
      }
      
      transporter.sendMail(message).then(() => {
        console.log('birthday message sent')
      }).catch(error => {
        console.log(error.message)
      })
         }
})

} 



setInterval(()=>{
  sendBirtdaysEmail()
  //this should log 24hrs
},86400000)