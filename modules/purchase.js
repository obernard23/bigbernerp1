const mongoose = require('mongoose');


const Virtualstorage = new mongoose.Schema({
    productsId:{
        type:mongoose.Types.ObjectId,
        ref:'products',
        required:true,
    },
    PurchasedQty:{
        type:Number, 
        default:0
    },
    ActivityLog:{
        type:Array, 
    },
})


const VirtualstorageProduct = mongoose.model('Virtualstorage',Virtualstorage);

module.exports = VirtualstorageProduct