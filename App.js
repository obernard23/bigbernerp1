const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const authRoutes = require("./Routes/authenticate");
const cookieParser = require("cookie-parser");
const { requireAuth, checkUser } = require("./middleware/authmidddleware");
const Dotenv = require("./.env");
const { WHouse } = require("./modules/warehouse");

//initialize app
const app = express();

mongoose.set("strictQuery", true);
mongoose
  .connect(Dotenv.dbUrl, { useNewUrlParser: true })
  .then((result) => {
    app.listen(Dotenv.PORT, () => {
      console.log(`connected to ${Dotenv.PORT}`);
      setInterval(()=>{console.log('server running')},1000)
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
  //check and create virtual ware house
  try {
    const WHouses = await WHouse.find();
    if (WHouses.length < 1) {
      await WHouse.create({
        WHName: "Virtual WareHouse",
        Manager: "Virtual Bot",
        Location: "Cloud",
        Tel: "###-####-###-###",
        Email: "virtual@bot.com",
        state: "Cloud Location",
        InvoiceNo: "####",
        others: "",
        Status: true,
      }).then((result) => {
        res.status(200).render("warehouse", {
          success: " Virtual ware house was created automatically",
          title: "Warehouse",
          WHouses,
        });
        next();
      });
    }
    res.redirect("/Dashboard/userid");
  } catch (error) {
    console.log(error);
  }
});
