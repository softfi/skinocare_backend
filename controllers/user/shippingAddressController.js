import User from "../../models/User.js";
import ShippingAddress from "../../models/ShippingAddress.js";
import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, responseWithData, responseWithoutData } from '../../helpers/helper.js';


export const shippingAddressList = async (req, res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        let shippingAddressList = await ShippingAddress.find({ customerId: user._id, isDeleted: false })
        responseWithData(res, 200, true, "Shipping Address List Fetch Successfully", shippingAddressList);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const addShippingAddress = async (req, res) => {
    try {
        let customer = await authValues(req.headers['authorization']);
        if(req?.body?.isDefault != undefined && req?.body?.isDefault == false) {
            let checkAdd = await ShippingAddress.findOne({customerId:customer._id,isDefault:true,isDeleted:false});
            if(checkAdd == null) {
                return responseWithoutData(res, 404, true, "Is Default Must Be true In Single Address");
            }
        } else if(req?.body?.isDefault != undefined && req?.body?.isDefault == true){
            await ShippingAddress.updateMany({customerId:customer._id},{$set:{isDefault:false}});
        }
        let shippingAddress = await ShippingAddress.create({
            name: req?.body?.name,
            customerId: customer._id,
            phone: req?.body?.phone,
            alternativePhone: req?.body?.alternativePhone ?? null,
            pincode: req?.body?.pincode,
            district: req?.body?.district,
            state: req?.body?.state,
            country: req?.body?.country ?? "India",
            area: req?.body?.area,
            locatity: req?.body?.locatity,
            landmark: req?.body?.landmark,
            houseNo: req?.body?.houseNo,
            isDefault: req?.body?.isDefault,
        });
        if (shippingAddress) {
            responseWithData(res, 200, true, "Shipping Address Added Successfully", shippingAddress);
        } else {
            responseWithoutData(res, 403, false, "Failed to Add Shipping Address");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getshippingAddressById = async (req, res) => {
    try {
        let customer = await authValues(req.headers['authorization'])
        let shippingAddress = await ShippingAddress.findOne({ _id: req.params.shippingAddressId, customerId: customer._id, isDeleted: false });
        if (shippingAddress) {
            responseWithData(res, 200, true, "Shipping Address Get Successfully", shippingAddress);
        } else {
            responseWithoutData(res, 201, false, "Shipping Address Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const updateShippingAddress = async (req, res) => {
    try {
        let customer = await authValues(req.headers['authorization'])
        if(req?.body?.isDefault != undefined && req?.body?.isDefault == false) {
            let checkAdd = await ShippingAddress.findOne({customerId:customer._id,isDefault:true,isDeleted:false});
            if(checkAdd == null) {
                return responseWithoutData(res, 404, true, "Is Default Must Be true In Single Address");
            }
        } else if(req?.body?.isDefault != undefined && req?.body?.isDefault == true){
            await ShippingAddress.updateMany({customerId:customer._id},{$set:{isDefault:false}});
        }
        let shippingAddress = await ShippingAddress.findOne({ _id: req.body.shippingAddressId, customerId: customer._id, isDeleted: false });
        if(shippingAddress) {
            shippingAddress.name = req.body.name ?? shippingAddress.name;
            shippingAddress.phone = req.body.phone ?? shippingAddress.phone;
            shippingAddress.alternativePhone = req.body.alternativePhone ?? shippingAddress.alternativePhone;
            shippingAddress.pincode = req.body.pincode ?? shippingAddress.pincode;
            shippingAddress.district = req.body.district ?? shippingAddress.district;
            shippingAddress.state = req.body.state ?? shippingAddress.state;
            shippingAddress.country = req?.body?.country ?? shippingAddress.country;
            shippingAddress.area = req.body.area ?? shippingAddress.area;
            shippingAddress.locatity = req.body.locatity ?? shippingAddress.locatity;
            shippingAddress.landmark = req.body.landmark ?? shippingAddress.landmark;
            shippingAddress.houseNo = req.body.houseNo ?? shippingAddress.houseNo;
            shippingAddress.isDefault= req.body.isDefault ?? shippingAddress.isDefault;

            if(await shippingAddress.save()) {
                responseWithData(res, 200, true, "Shipping Address Updated Successfully",shippingAddress);
            } else {
                responseWithoutData(res, 403, false, "Failed to Update Shipping Address");
            }
        } else {
            responseWithoutData(res, 201, false, "Shipping Address Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const deleteShippingAddress = async(req, res)=>{
    try {
        let customer = await authValues(req.headers['authorization']);
        let shippingAddress = await ShippingAddress.findOne({ _id: req.body.shippingAddressId, customerId: customer._id, isDeleted: false });
        if (shippingAddress) {
            shippingAddress.isDeleted=true;
            if (await shippingAddress.save()) {
                responseWithoutData(res, 200, true, "Shipping Address Deleted Successfully");
            } else {
                responseWithoutData(res, 403, false, "Failed to Delete Shipping Address");
            }
        } else {
            responseWithoutData(res, 201, false, "Shipping Address Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const defaultShippingAddress = async(req, res)=>{
    try {
        let customer = await authValues(req.headers['authorization']);
        let shippingAddress = await ShippingAddress.findOne({ customerId: customer._id,isDefault:true, isDeleted: false });
        if (shippingAddress) {
            responseWithData(res, 200, true, "Default Shipping Address Fetch Successfully!!",shippingAddress);
        } else {
            responseWithoutData(res, 201, false, "No Default Shipping Address Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}