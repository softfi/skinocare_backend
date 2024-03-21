import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import Coupon from "../../models/Coupon.js";

export const couponList = async (req, res) => {
    try {
        // let totalData = await Coupon.countDocuments({ isActive: true, isDeleted: false });
        // let numberOfItems = 12;
        // let currentPage = Number(req.body.pageNumber ?? 1);
        // let coupons = await Coupon.find({ isActive: true, isDeleted: false }).skip(numberOfItems * (currentPage - 1)).limit(numberOfItems);
        let coupons = await Coupon.find({ isActive: true, isDeleted: false });
        if(coupons.length > 0){
            return responseWithData(res, 200, true, "Coupon List get Successfully", coupons);
        }
        return responseWithoutData(res, 404, false, "No Coupons Found");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const addCoupon = async (req, res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        const {code,type,discount,discountUpTo,expiredAt,limit} = req?.body;
        if(limit != '' && limit != null && limit != undefined ){
            if(isNaN(limit)){
                return responseWithoutData(res, 400, false, "Limit must be in Numeric Format");
            }
        }
        if(discountUpTo != '' && discountUpTo != null && discountUpTo != undefined ){
            if(isNaN(discountUpTo)){
                return responseWithoutData(res, 400, false, "Discount UpTo must be in Numeric Format");
            }
        }
        let coupon = await Coupon.create({
            code            : code,
            type            : type,
            discount        : discount,
            discountUpTo    : discountUpTo,
            totalLimit      : limit,
            balanceLimit    : limit,
            expiredAt       : new Date(expiredAt),
            addedBy         : user?._id,
        });
        if(coupon) {
            return responseWithoutData(res, 200, true, "Coupon Created Successfully");
        }
        return responseWithoutData(res, 400, true, "Coupon Creation Failed");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getCouponById = async (req,res) => {
    try {
        let coupon = await Coupon.findOne({ _id: req.params.couponId, isDeleted: false });
        if(coupon){
            responseWithData(res, 200, true, "Coupon Get Successfully", coupon);
        }else{
            responseWithoutData(res, 404, false, "Coupon Not Found");
        } 
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const updateCoupon = async (req,res) => {
    try {
        const {couponId,code,type,discount,discountUpTo,expiredAt,limit} = req?.body;
        let checkCoupon = await Coupon.findOne({ _id: couponId, isDeleted: false });
        if(checkCoupon == null) {
            return responseWithoutData(res, 400, false, "Coupon Data not Found");
        }
        if(limit != '' || limit != null || limit != undefined ){
            if(isNaN(limit)){
                return responseWithoutData(res, 400, false, "Limit must be in Numeric Format");
            }
        }
        
        if(discountUpTo != '' || discountUpTo != null || discountUpTo != undefined ){
            if(isNaN(discountUpTo)){
                return responseWithoutData(res, 400, false, "Discount UpTo must be in Numeric Format");
            }
        }
        let coupon = await Coupon.findByIdAndUpdate(couponId,{$set:{
            code            : code,
            type            : type,
            discount        : discount,
            discountUpTo    : discountUpTo,
            totalLimit      : limit,
            expiredAt       : new Date(expiredAt)
        }});
        if(coupon) {
            return responseWithoutData(res, 200, true, "Coupon has been Updated Successfully");
        } else {
            return responseWithoutData(res, 400, false, "Coupon Updation Failed");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const deleteCoupon = async(req, res)=>{
    try {
        let coupon = await Coupon.findOne({ _id: req?.params?.couponId, isDeleted: false });
        if(coupon){
            coupon.isDeleted = true;
            if(await coupon.save()){
                responseWithData(res, 200, true, "Coupon Deleted Successfully");
            }else{
                responseWithoutData(res, 403, false,"Failed to delete Coupon");
            }
        }else{
            responseWithoutData(res, 404, false, "Coupon Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}