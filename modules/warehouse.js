const mongoose = require('mongoose');
const { isEmail} = require('validator');

const itemsSchema = new mongoose.Schema({
    product:{
        type:mongoose.Types.ObjectId,
        ref:'Products',
        required:true,
    },
    productName:{type:String},
    productImg:{type:String},
    productUOM:{type:String},
    qtySent:{type:Number},
    qtyScraped:{type:Number},
    qtyPerformed:{type:Number},

});

const StorageSchema =  new mongoose.Schema({
    productId:{
        type:mongoose.Types.ObjectId,
        ref:'Products',
        required:true,
    },
    productQty:{
        type:Number,
        default:0
    },
    autoReplenishment:{
        type:Boolean,
        default:false
    },
    replenishQty:{
        type:Number,
        default:0
    },
    WHIDS:{
        type:mongoose.Types.ObjectId,
        ref:'WHouse',
        required:true,
    },
    currentQty:{
        type:Number,
        default:0
    },
    replenishBy:{
        type:String,
    },
    pendings:{
        type:Number,
        default:0
    },
    replenishMin:{
        type:Number,
        default:0
    },
    ActivitiyLog:[],
})



const WHSchema = new  mongoose.Schema({
    WHName:{
        type : String,
        required:true,
        lowercase:true
    },
    toRecive:[],
    Bills:[],
    Storage:[ StorageSchema ],
    Notification:{
        type:Array,
    },
    expense:{
        type:Array,
    },
    Tel:{
        type:String,
        unique:true,
    },
    Email:{
        type:String,
        required:[true,'please entert an Email'],
        unique:true,
        lowercase:true,
        validate:[isEmail,'please eneter a valid Email']
    },
    Status:{
        type:Boolean,
        default:false,
    },
    state:{
        type:String,
    },
    InvoiceNo:{
        type:String,
        required:true
    },
    others:{
        type:String,
    },
    Documents:{
        type:Array,
    },
    WHIDS:{
        type: String,
    },
    Note:{
        type:Array,
    },
    Manager:{
        type:String
    },
    Scrap:{
        type:Array,
    }
},{timestamps:true});

const  WHouse = mongoose.model(' WHouse',WHSchema);
const items = mongoose.model('item',itemsSchema)
const storeProduct = mongoose.model('storeProduct',StorageSchema)

module.exports = {WHouse,items,storeProduct};