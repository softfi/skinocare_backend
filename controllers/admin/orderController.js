import { errorLog } from "../../config/logger.js";
import { errorResponse, responseWithData } from "../../helpers/helper.js";
import Order from "../../models/Order.js";
import ShippingAddress from "../../models/ShippingAddress.js";
import User from "../../models/User.js";


export const orderList = async(req, res)=>{
    try {
        let orders = await Order.find().sort({"created": -1});
        let orderList = [];
        for(let order of orders){
            let customer = await User.findById(order?.customerId);
            orderList.push({ ...order._doc, customer:customer?.name, customerId:customer?.customerId  });
        }
        responseWithData(res, 200, true, "Order List Fetch Successfully", orderList);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const orderDetails = async(req, res)=>{
    try {
        let orderDetails = await Order.findById(req.params.orderId);
        let customer = await User.findById(orderDetails.customerId).select("name email mobile");
        let shippingAddress = await ShippingAddress.findById(orderDetails.shippingAddressId);
        responseWithData(res, 200, true, "Order List Fetch Successfully", {orderDetails,customer,shippingAddress});
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}