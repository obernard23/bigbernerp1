const { WHouse } = require("../modules/warehouse");
const Employe = require("../modules/Employees");
const { ObjectId } = require("mongodb");

async function ValidStockTransfer(req, res, next) {
  if (ObjectId.isValid(req.params.id)) {
    user = await Employe.findById(new ObjectId(req.params.id));
    
    if( user.role === "Admin"){
        next();
    }else if (user) {
      const WHouses = [];
      await WHouse.findById(new ObjectId(user.workLocation)).then((warehouse) =>
        WHouses.push(warehouse)
      );
      res.status(200).render("warehouse", { title: "Warehouse", WHouses });
    }
  }
}

// warehouse setup  for route protection
async function adminWareHouseSetUp(req, res, next) {

  if (ObjectId.isValid(req.params.ADMINID)) {
    user = await Employe.findById(new ObjectId(req.params.ADMINID));
    if( user.role === "Admin"){
      next();
  }else{
    res.redirect('/logout')
  }
  }
}

module.exports = {
  ValidStockTransfer,
  adminWareHouseSetUp};
