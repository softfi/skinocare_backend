import { model, Schema } from "mongoose";

const headDoctorSchema = Schema({
    image                   : { type:String, index: true },
    name                    : { type:String, index: true },
    experties               : { type:String, index: true  },
    shortDescription        : { type:String, index: true  },
    description             : { type:String, index: true  },
    email                   : { type:String, index:true, unique: true },
    mobile                  : { type:Number, index:true, unique: true },
    alternativeMobile       : { type:Number, index:true },
    specialisation          : { type:String, index:true },
    designation             : { type:String, index:true , default:'head_doctor'},
    aboutYou                : { type:Array, index:true },
    medicalCouncilRegNumber : { type:String, index:true },
    qualifications          : { type:String, index:true },
    knowAboutMe             : { type:String, index:true },
    pincode                 : { type:Number, index:true },
    district                : { type:String, index:true },
    area                    : { type:String, index:true },
    streetName              : { type:String, index:true },
    houseNumber             : { type:String, index:true },
    landmark                : { type:String, index:true },
    advisor                 : { type:String, index:true },
},{ timestamps: true });
export default model('head_doctor', headDoctorSchema);