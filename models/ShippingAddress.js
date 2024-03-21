import { Schema, model } from "mongoose";

const shippingAddressSchema = Schema({
    name             : { type:String , required:true },
    customerId       : { type:Schema.Types.ObjectId , required:true },
    phone            : { type:String },
    alternativePhone : { type:String },
    pincode          : { type:String , required:true, index:true},
    district         : { type:String , required:true, index:true},
    state            : { type:String , required:true, index:true},
    country          : { type:String , index:true},
    area             : { type:String , required:true, index:true},
    locatity         : { type:String , required:true, index:true},
    landmark         : { type:String , required:true, index:true},
    houseNo          : { type:String , required:true, index:true},
    isDefault        : { type:Boolean , required:true, index:true, default:false},
    isDeleted        : { type:Boolean , required:true, index:true, default:false},
},{ timestamps: true });

export default model('ShippingAddress', shippingAddressSchema);