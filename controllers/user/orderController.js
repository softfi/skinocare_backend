
import Order from "../../models/Order.js";
import { errorLog } from "../../config/logger.js"
import { appliedCouponValue, authValues, emailNotification, errorResponse, getImageSingedUrlById, getNextOrderNo, getShiprokectTrakingLink, isCartStock, isStock, responseWithData, responseWithoutData, sendPushNotification } from "../../helpers/helper.js"
import Product from "../../models/Product.js";
import Cart from "../../models/Cart.js";
import Coupon from "../../models/Coupon.js";
import ShippingAddress from "../../models/ShippingAddress.js"
import { addShiprocketOrder } from "./shiprocketController.js";
import Setting from "../../models/Setting.js";
import kit from "../../models/kit.js";
import User from "../../models/User.js";
import walletHistory from "../../models/walletHistory.js";

export const orderList = async (req, res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        let orders = await Order.find({ customerId: user._id, $or: [{ paymentMethod: 'cod'}, { paymentMethod: 'online', paymentStatus: 'paid'}] }).sort({ createdAt: -1 });
        let kitOrders = await Order.find({ customerId: user._id, $or: [{ paymentMethod: 'cod', isKit: true }, { paymentMethod: 'online', paymentStatus: 'paid', isKit: true }] }).populate("kitId").sort({ createdAt: -1 });
        var completeOrders = [];
        var activeOrders = [];
        var kitOrderDatas = [];
        for (let kitOrder of kitOrders) {
            kitOrderDatas.push({
                ...kitOrder._doc,
                // kitId.image: getShiprokectTrakingLink(kitOrder.orderNo),
                kitId:{...kitOrder?._doc?.kitId?._doc,image: (kitOrder?.kitId?.image) ? await getImageSingedUrlById(kitOrder?.kitId?.image) : null},
                shipmentLink: getShiprokectTrakingLink(kitOrder.orderNo),
                address: await ShippingAddress.findById(kitOrder.shippingAddressId).select('name phone alternativePhone pincode district state country area locatity landmark houseNo')
            });
        }
        for (let order of orders) {
            for (let detail of order.orderDetails) {
                const product = await Product.findById(detail.productId);
                if (order.orderStatus == "cancelled" || order.orderStatus == "delivered") {
                    completeOrders.push({
                        name: detail.name,
                        thumbnail: await getImageSingedUrlById(product.thumbnail),
                        orderId: order.orderNo,
                        quantity: detail.quantity,
                        amount: Number(detail.price)*Number(detail.quantity),
                        orderStatus: order.orderStatus,
                        shipmentLink: getShiprokectTrakingLink(order.orderNo),
                        paymentStatus: order.paymentStatus,
                        generatedAt: order.createdAt,
                        address: await ShippingAddress.findById(order.shippingAddressId).select('name phone alternativePhone pincode district state country area locatity landmark houseNo')
                    });
                } else {
                    activeOrders.push({
                        name: detail.name,
                        thumbnail: await getImageSingedUrlById(product.thumbnail),
                        orderId: order.orderNo,
                        quantity: detail.quantity,
                        amount: Number(detail.price)*Number(detail.quantity),
                        orderStatus: order.orderStatus,
                        shipmentLink: getShiprokectTrakingLink(order.orderNo),
                        paymentStatus: order.paymentStatus,
                        generatedAt: order.createdAt,
                        address: await ShippingAddress.findById(order.shippingAddressId).select('name phone alternativePhone pincode district state country area locatity landmark houseNo')
                    });
                }
            }
        }
        responseWithData(res, 200, true, "Order List Fetch Successfully", { completeOrders, activeOrders, kitOrderDatas });
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const addOrder = async (req, res) => {
    try {
        let shippingMethods = await Setting.findOne({ type: "shipping_method" });
        let paymentMethods = await Setting.findOne({ type: "payment_method" });
        let shippingCost = shippingMethods.value[0][req.body.shippingMethod];
        let paymentMethod = paymentMethods.value[0][req.body.paymentMethod];
        let user = await authValues(req.headers['authorization']);
        if (req.body.checkoutType == "buy" || req.body.checkoutType == "cart") {
            if (req?.body?.couponCode != undefined && req?.body?.couponCode != null && req?.body?.couponCode != '') {
                let coupon = await Coupon.findOne({ code: req?.body?.couponCode, balanceLimit: { $gt: 0 } });
                if (coupon == null) {
                    return responseWithoutData(res, 404, false, "Coupon has used in maximum limit!!");
                }
            }
            let subTotal = 0;
            let gstCost = 0;
            let grandTotal = 0;
            let products = [];
            if (req.body.checkoutType == "buy") {
                let product = await Product.findOne({ _id: req.body.productId }).select('name price shippingCost gst');
                if (product) {
                    if (await isStock(product._id, req.body.quantity)) {
                        subTotal = Number(Number((product.price * req.body.quantity)).toFixed(2));
                        gstCost = Number(Number((product.gst / 100) * (product.price * req.body.quantity))?.toFixed(2));
                        products.push({ ...product._doc, productId: product._doc?._id, gstCost, quantity: req.body.quantity });
                        await Product.updateOne({ _id: req.body.productId }, { $inc: { currentStock: -req.body.quantity } });
                    } else {
                        responseWithoutData(res, 400, false, "Product Stock is Exceeded");
                    }
                } else {
                    responseWithoutData(res, 404, false, "No Product Found!");
                }
            }
            else if (req.body.checkoutType == "cart") {
                if (await isCartStock(user._id)) {
                    let cartProducts = await Cart.aggregate([
                        { $lookup: { from: "products", localField: "productId", foreignField: "_id", as: "product" } },
                        { $match: { customerId: user._id } }
                    ]);
                    cartProducts.map(async (cartProduct) => {
                        gstCost += Number(Number(cartProduct?.product[0].gst / 100) * (cartProduct?.product[0].price * Number(cartProduct?.quantity)))?.toFixed(2);
                        subTotal += Number(cartProduct?.product?.[0]?.price) * Number(cartProduct?.quantity);
                        products.push({ name: cartProduct?.product?.[0]?.name, productId: cartProduct?.product?.[0]?._id, quantity: cartProduct?.quantity, price: cartProduct?.product?.[0]?.price, gstCost: Number(cartProduct?.product[0].gst / 100) * (cartProduct?.product[0].price * Number(cartProduct?.quantity)), gst: cartProduct?.product?.[0]?.gst, shippingCost: cartProduct?.product?.[0]?.shippingCost });
                        await Product.updateOne({ _id: cartProduct?.product?.[0]?._id }, { $inc: { currentStock: -cartProduct?.quantity } });
                    });
                    if (req?.body?.discount > 0) {
                        await Coupon.updateOne({ code: req?.body?.couponCode }, { $inc: { balanceLimit: -1 } });
                    }
                }
                else {
                    responseWithoutData(res, 400, false, "Product Stock is Exceeded");
                }
            }
            let productIds = products.map((pid) => pid?.productId);
            await Cart.deleteMany({ customerId: user?._id, productId: { $in: productIds } });
            let discount = 0;
            grandTotal = Number(subTotal) + Number(shippingCost);
            if (req?.body?.couponCode != undefined && req?.body?.couponCode != null && req?.body?.couponCode != '') {
                discount = await appliedCouponValue(req?.body?.couponCode, subTotal, res, user?._id);
                grandTotal -= Number(discount);
            }
            let orderNo = await getNextOrderNo();
            let order = await Order.create({
                orderNo: orderNo,
                customerId: user?._id,
                paymentStatus: 'unpaid',
                orderStatus: 'pending',
                paymentMethod: paymentMethod,
                shippingMethod: req?.body?.shippingMethod,
                subTotal: Number(subTotal),
                shippingAddressId: req?.body?.shippingAddressId,
                couponCode: req?.body?.couponCode,
                discount: discount,
                invoiceNo: orderNo,
                tax: Number(gstCost),
                shippingCost: Number(shippingCost),
                grandTotal: Number(grandTotal),
                orderDetails: products
            });

            if(paymentMethod == 'cod'){
                /**GENERATE*THE*ORDER*IN*SHIPROCKET**/
                let shiprocket = await addShiprocketOrder(order);
                order.shiprocketDetails = shiprocket;
                /***********************************/
    
                if (await order.save()) {
                    let shippingAddress = await ShippingAddress.findById(order.shippingAddressId);
    
                    /*  Email Notification to Admin Block Start */
                    let body = "Dear Admin, <br> <br> Good news! A new order has been placed. Here are the details:<br><br>Order ID: " + order?.orderNo + "<br>Customer: " + user?.name + "<br>Delivery Address: " + shippingAddress.district + "," + shippingAddress.state + " - " + shippingAddress.pincode + "<br>Order Total: " + order?.grandTotal + "";
                    let subject = "New Order Received";
                    let toEmail = "skin0care224@gmail.com";         // Dynamic After Admin Panel Complete
    
                    emailNotification(toEmail, subject, body);
    
                    /*  Email Notification to Admin Block End */
                    await sendPushNotification(order?.customerId,"Order Confirmed - SkinOcare",`Hello ${user?.name}, Thank you for shopping with SkinOcare! Your order ${order?.orderNo} has been confirmed. You can track your order status in your account.`,"","/order");
                    return responseWithData(res, 200, true, "Order has been Placed Successfully!", order);
                }
                else {
                    responseWithData(res, 221, true, "Order has been Placed Successfully!Shipped Later", order);
                }
            } else {
                return responseWithData(res, 200, true, "Order has been Placed Successfully!", order);
            }
        }
        else {
            responseWithoutData(res, 201, false, "Checkout Type Must be cart or buy")
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}



export const addKitOrder = async (req, res) => {
    try {
        let shippingMethods = await Setting.findOne({ type: "shipping_method" });
        let paymentMethods = await Setting.findOne({ type: "payment_method" });
        let shippingCost = shippingMethods.value[0][req.body.shippingMethod];
        let paymentMethod = paymentMethods.value[0][req.body.paymentMethod];
        const useWalletPoint = req.body.useWalletPoint ? req.body.useWalletPoint : false;
        let customer = await authValues(req.headers['authorization']);
        let grandTotal = 0;
        let products = [];
        let currentWalletPoint = customer?.currentWalletPoint ? customer?.currentWalletPoint : 0;
        let kitType = (req?.body?.type == 'hair') ? 'hairKitId' : 'skinKitId';
        let kitDetails = await kit.findOne({ _id: customer?.[kitType] }).populate(['products']);
        if (kitDetails) {
            kitDetails?.products?.map(async (kitProduct) => {
                products.push({ name: kitProduct?.name, productId: kitProduct._id, quantity: 1, price: 1, gstCost: Number(kitProduct.gst / 100) });
            })
            let discount = 0;
            grandTotal = Number(kitDetails?.price);
            if (useWalletPoint == true) {
                if (Number(grandTotal) > Number(currentWalletPoint)) {
                    discount = Number(currentWalletPoint);
                    grandTotal = grandTotal - Number(currentWalletPoint);
                    await User.findOneAndUpdate({ _id: customer?._id }, { $set: { currentWalletPoint: Number(Number(currentWalletPoint) - Number(discount)) } });
                } else {
                    discount = Number(grandTotal - 1);
                    grandTotal = grandTotal - Number(grandTotal - 1);
                    await User.findOneAndUpdate({ _id: customer?._id }, { $set: { currentWalletPoint: Number(Number(currentWalletPoint) - Number(discount)) } });
                }
            } else {
                discount = 0;
            }
            let orderNo = await getNextOrderNo();
            let order = await Order.create({
                orderNo: orderNo,
                customerId: customer?._id,
                paymentStatus: 'unpaid',
                orderStatus: 'pending',
                paymentMethod: paymentMethod,
                shippingMethod: req?.body?.shippingMethod,
                subTotal: Number(grandTotal),
                shippingAddressId: req?.body?.shippingAddressId,
                couponCode: req?.body?.couponCode,
                invoiceNo: orderNo,
                tax: Number(0),
                shippingCost: Number(shippingCost),
                grandTotal: Number(grandTotal) + Number(shippingCost),
                discount:Number(discount),
                orderDetails: products,
                isKit: true,
                kitId: kitDetails._id
            });

            if(paymentMethod == 'cod') {
                /**GENERATE*THE*ORDER*IN*SHIPROCKET**/
                let shiprocket = await addShiprocketOrder(order);
                order.shiprocketDetails = shiprocket;
                // /***********************************/
    
                if (await order.save()) {
                    let shippingAddress = await ShippingAddress.findById(order.shippingAddressId);
    
                    /*  Email Notification to Admin Block Start */
                    let body = "Dear Admin, <br> <br> Good news! A new order has been placed. Here are the details:<br><br>Order ID: " + order?.orderNo + "<br>Customer: " + customer?.name + "<br>Delivery Address: " + shippingAddress.district + "," + shippingAddress.state + " - " + shippingAddress.pincode + "<br>Order Total: " + order?.grandTotal + "";
                    let subject = "New Order Received";
                    let toEmail = "skin0care224@gmail.com";         // Dynamic After Admin Panel Complete
    
                    emailNotification(toEmail, subject, body);
    
                    /*  Email Notification to Admin Block End */
                    await sendPushNotification(order?.customerId,"Order Confirmed - SkinOcare",`Hello ${customer?.name}, Thank you for shopping with SkinOcare! Your order ${order?.orderNo} has been confirmed. You can track your order status in your account.`,"","/order");
    
                    responseWithData(res, 200, true, "kit has been Placed Successfully!", order);
                }
                else {
                    responseWithData(res, 221, true, "Kit has been Placed Successfully!Shipped Later", order);
                }
            } else  {
                responseWithData(res, 200, true, "kit has been Placed Successfully!", order);
            }
        } else {
            responseWithoutData(res, 404, false, "Kit Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

