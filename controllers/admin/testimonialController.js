import Testimonial from "../../models/Testimonial.js";
import { authValues, errorResponse, getImageSingedUrlById, responseWithData, responseWithoutData } from "../../helpers/helper.js"
import { errorLog } from "../../config/logger.js";

export const testimonialList = async(req, res)=>{
    try {
        let testimonials = await Testimonial.find({ isDeleted: false }).select("name image age title address description isActive");
        let testimonialList =[];
        for(let i=0;i<testimonials.length;i++){
            testimonialList.push({_id:testimonials[i]?._id, name: testimonials[i]?.name, image: await getImageSingedUrlById(testimonials[i]?.image), age: testimonials[i]?.age, title: testimonials[i]?.title, address: testimonials[i]?.address, description: testimonials[i]?.description, isActive: testimonials[i]?.isActive})
        }
        responseWithData(res, 200, true, "Testimonial List Fetched Successfully", testimonialList);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const addTestimonial = async(req, res)=>{
    try {
        let user = await authValues(req.headers['authorization']);
        let testimonial = await Testimonial.create({
            name        : req.body.name,
            image       : req.body.image,
            age         : req.body.age,
            title       : req.body.title,
            address     : req.body.address,
            description : req.body.description,
            addedBy     : user._id,
        });
        if(testimonial){
            responseWithoutData(res, 200, true, "Testimonial Created Successfully");
        }else{
            responseWithoutData(res, 501, false, "Testimonial Creation failed");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getTestimonialById = async(req, res)=>{
    try {
        let testimonial = await Testimonial.findOne({ _id:req.params.testimonialId, isDeleted:false });
        if(testimonial){
            responseWithData(res, 200, true, "Testimonial Get Successfully", testimonial);
        }else{
            responseWithoutData(res, 501, false, "Testimonial Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const updateTestimonial = async(req, res)=>{
    try {
        let testimonial = await Testimonial.findOne({ _id: req.body.testimonialId, isDeleted:false });
        if(testimonial){
            testimonial.name = req.body.name ? req.body.name : testimonial.name ;
            testimonial.image = req.body.image ? req.body.image : testimonial.image ;
            testimonial.age = req.body.age ? req.body.age : testimonial.age;
            testimonial.title = req.body.title ? req.body.title : testimonial.title;
            testimonial.address = req.body.address ? req.body.address : testimonial.address;
            testimonial.description = req.body.description ? req.body.description : testimonial.description ;
            testimonial.isActive = req.body.isActive ? req.body.isActive : testimonial.isActive ;
            if(await testimonial.save()){
                responseWithoutData(res, 200, true, "Testimonial Updated Successfully");
            }else{
                responseWithoutData(res, 403, false,"Failed to Update Testimonial");
            }
        }else{
            responseWithoutData(res, 501, false, "Testimonial Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const deleteTestimonial = async(req, res)=>{
    try {
        let testimonial = await Testimonial.findOne({ _id: req.params.testimonialId, isDeleted:false });
        if(testimonial){
            testimonial.isDeleted = true;
            if(await testimonial.save()){
                responseWithoutData(res, 200, true, "Testimonial Deleted Successfully");
            }else{
                responseWithoutData(res, 403, false,"Failed to Delete Testimonial");
            }
        }else{
            responseWithoutData(res, 404, false, "Testimonial Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}