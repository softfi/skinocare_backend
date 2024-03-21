import { Schema } from "mongoose";
import { errorLog } from "../../config/logger.js";
import {
  authValues,
  errorResponse,
  getImageSingedUrlById,
  isCartStock,
  isStock,
  responseWithData,
  responseWithoutData,
} from "../../helpers/helper.js";
import Product from "../../models/Product.js";
import Cart from "../../models/Cart.js";
import Setting from "../../models/Setting.js";
import User from "../../models/User.js";
import kit from "../../models/kit.js";
import DoctorDetail from "../../models/DoctorDetail.js";
import Order from "../../models/Order.js";
export const billing = async (req, res) => {
  try {
    let shippingMethods = await Setting.findOne({ type: "shipping_method" });
    let shippingCost = shippingMethods.value[0][req.body.shippingMethod];
    if (req.body.checkoutType == "buy") {
      let customer = await authValues(req.headers["authorization"]);
      let product = await Product.findOne({ _id: req.body.productId }).select(
        "name price shippingCost gst mrp thumbnail"
      );
      const cart = await Cart.findOne({
        productId: req.body.productId,
        customerId: customer._id,
      });
      if (await isStock(product._id, req.body.quantity)) {
        if (!cart) {
          let addToCart = await Cart.create({
            customerId: customer._id,
            productId: req.body.productId,
            quantity: req.body.quantity,
          });
        }
        if (product) {
          let products = [];
          let gstCost =
            (product.gst / 100) * (product.price * req.body.quantity);
          let grandTotal = Number(
            Number(product.price * req.body.quantity + shippingCost)?.toFixed(2)
          );
          const mrp = Number(product?.mrp * req.body.quantity);
          const productPrice = Number(product?.price * req.body.quantity);
          const discountPrice = Number(mrp) - Number(productPrice);
          const delivaryCharge = Number(shippingCost);
          const totalAmount = Number(productPrice + delivaryCharge);
          const savedAmount = Number(mrp - totalAmount);
          products.push({
            name: product.name,
            price: product.price,
            mrp: product.mrp,
            thumbnail: await getImageSingedUrlById(product.thumbnail),
            quantity: req.body.quantity,
          });
          const priceDetails = {
            mrp: mrp,
            subTotal: productPrice,
            discountPrice: discountPrice,
            shippingCost: delivaryCharge,
            grandTotal: totalAmount,
            savedAmount: savedAmount,
            products: products,
          };
          // responseWithData(res, 200, true, "Billing Details Fetch Successfully", { subTotal: Number(Number((product.price * req.body.quantity)+gstCost).toFixed(2)), shippingCost: Number(Number(shippingCost).toFixed(2)), gstCost: Number(Number(gstCost)?.toFixed(2)), grandTotal, products });

          responseWithData(
            res,
            200,
            true,
            "Billing Details Fetch Successfully",
            priceDetails
          );
        } else {
          responseWithoutData(res, 404, false, "No Product Found!");
        }
      } else {
        responseWithoutData(res, 400, false, "Product Stock is Exceeded");
      }
    } else if (req.body.checkoutType == "cart") {
      let customer = await authValues(req.headers["authorization"]);
      if (await isCartStock(customer._id)) {
        let cartProducts = await Cart.aggregate([
          {
            $lookup: {
              from: "products",
              localField: "productId",
              foreignField: "_id",
              as: "product",
            },
          },
          { $match: { customerId: customer._id } },
        ]);
        let subTotal = 0;
        let gstCost = 0;
        let grandTotal = 0;
        let mrp = 0;
        let productPrice = 0;
        let delivaryCharge = Number(Number(shippingCost).toFixed(2));
        let totalAmount = 0;
        let savedAmount = 0;
        let products = [];
        for (let cartProduct of cartProducts) {
          gstCost +=
            Number(cartProduct?.product[0].gst / 100) *
            (cartProduct?.product[0].price * Number(cartProduct?.quantity));
          subTotal +=
            Number(cartProduct?.product?.[0]?.price) *
            Number(cartProduct?.quantity) +
            gstCost;
          mrp +=
            Number(cartProduct?.product[0]?.mrp) *
            Number(cartProduct?.quantity);
          productPrice +=
            Number(cartProduct?.product[0]?.price) *
            Number(cartProduct?.quantity);
          products.push({
            name: cartProduct?.product?.[0]?.name,
            price: cartProduct?.product?.[0]?.price,
            mrp: cartProduct?.product?.[0]?.mrp,
            thumbnail: await getImageSingedUrlById(
              cartProduct?.product?.[0]?.thumbnail
            ),
            quantity: cartProduct.quantity,
          });
        }
        totalAmount = Number(productPrice);
        savedAmount = Number(Number(mrp) - Number(totalAmount));
        totalAmount += Number(delivaryCharge);
        const priceDetails = {
          mrp: mrp,
          subTotal: productPrice,
          discountPrice: Number(mrp) - Number(productPrice),
          shippingCost: delivaryCharge,
          grandTotal: totalAmount,
          savedAmount: savedAmount,
          products: products,
        };
        grandTotal = Number(subTotal) + Number(shippingCost) - gstCost;
        // responseWithData(res, 200, true, "Billing Details Fetch Successfully", {
        //   subTotal: Number(Number(subTotal).toFixed(2)),
        //   shippingCost: Number(Number(shippingCost).toFixed(2)),
        //   gstCost: Number(Number(gstCost)?.toFixed(2)),
        //   grandTotal: Number(Number(grandTotal).toFixed(2)),
        //   products,
        // });
        responseWithData(
          res,
          200,
          true,
          "Billing Details Fetch Successfully",
          priceDetails
        );
      } else {
        responseWithoutData(res, 400, false, "Product Stock is Exceeded");
      }

    } else if (req.body.checkoutType == "kit") {
      let kitType = (req?.body?.type == 'hair') ? 'hairKitId' : 'skinKitId';
      let customer = await authValues(req.headers["authorization"]);
      let kitDetails = await kit.findOne({ _id: customer?.[kitType] }).populate(['products']);
      const delivaryCharge = Number(shippingCost);
      const totalAmount = Number(kitDetails?.price + delivaryCharge);
      const priceDetails = {
        mrp: kitDetails.price,
        subTotal: kitDetails?.price,
        discountPrice: 0,
        shippingCost: delivaryCharge,
        grandTotal: totalAmount,
        savedAmount: savedAmount,
        products: priceDetails.products,
      };
      responseWithData(
        res,
        200,
        true,
        "Billing Details Fetch Successfully",
        priceDetails
      );
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};


export const kitCheckout = async (req, res) => {
  try {
    let customer = await authValues(req.headers["authorization"]);
    let kitType = (req?.body?.type == 'hair') ? 'hairKitId' : 'skinKitId';
    let doctorType = (req?.body?.type == 'hair') ? 'hairDoctor' : 'skinDoctor';
    let mainConcern = (req?.body?.type == 'hair') ? customer?.hairConcern : customer?.skinConcern;
    const kitDetails = await kit.findOne({ _id: customer?.[kitType] }).populate(['symtom','products']);
    const checkOrder = await Order.findOne({customerId:customer?._id,isKit:true,kitId:kitDetails?._id, $or: [{ paymentMethod: 'cod'}, { paymentMethod: 'online', paymentStatus: 'paid'}]});
    if (kitDetails) {
      const productDetailsWithImage = [];
      for(let productDetail of kitDetails?.products) {
        productDetailsWithImage.push({...productDetail?._doc,thumbnail:await getImageSingedUrlById(productDetail?.thumbnail),howToUseVideo:(productDetail?.howToUseVideo) ? productDetail?.howToUseVideo : null});
      }
      let doctorDetails = await DoctorDetail.findOne({_id:customer?.[doctorType]}).populate("designation");
      doctorDetails = {...doctorDetails?._doc,image:await getImageSingedUrlById(doctorDetails?.image),designation:doctorDetails?.designation?.designation};
      responseWithData(
        res,
        200,
        true,
        "Kit Details Fetch Successfully",
        {
          _id: kitDetails?._id,
          createdAt: kitDetails?.createdAt,
          name: kitDetails?.name,
          image: await getImageSingedUrlById(kitDetails?.image),
          symptom: kitDetails.symtom,
          price: kitDetails.price,
          mrp: (kitDetails?.mrp) ? kitDetails?.mrp: 0,
          type: kitDetails.type,
          productCount: kitDetails?.products?.length,
          product: productDetailsWithImage,
          doctor: doctorDetails,
          isPurchased: (checkOrder) ? true : false,
          mainConcern: (mainConcern) ? mainConcern : "",
          // kit: [{
          //   type: "Advance",
          //   price: kitDetails?.advancePrice,
          //   description: kitDetails?.advanceDescription,
          //   product: kitDetails?.advanceProducts.length
          // }, {
          //   type: "Pro",
          //   price: kitDetails?.proPrice,
          //   description: kitDetails?.proDescription,
          //   product: kitDetails?.advanceProducts.length
          // }, {
          //   type: " Assist",
          //   price: kitDetails?.assistPrice,
          //   description: kitDetails?.assistDescription,
          //   product: kitDetails?.advanceProducts.length
          // }]
        }
      );

    } else {
      responseWithoutData(res, 400, false, "Kit Not Found");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
}



export const KitBilling = async (req, res) => {
  try {
    let shippingMethods = await Setting.findOne({ type: "shipping_method" });
    let shippingCost = shippingMethods.value[0][req.body.shippingMethod];
    let kitType = (req?.body?.kitType == 'hair') ? 'hairKitId' : 'skinKitId';
    let customer = await authValues(req.headers["authorization"]);
    let kitDetails = await kit.findOne({ _id: customer?.[kitType] }).populate(['products']);
    let delivaryCharge = Number(shippingCost);
    let totalAmount = Number(Number(kitDetails?.price) + Number(delivaryCharge));
    let discount = 0;
    if (Number(totalAmount) > Number(customer.currentWalletPoint)) {
      discount = Number(customer.currentWalletPoint);
    } else {
      discount = Number(kitDetails?.price - 1);
    }
    const priceDetails = {
      mrp: kitDetails?.mrp,
      subTotal: kitDetails?.price,
      discountPrice: (kitDetails?.mrp && Number(kitDetails?.mrp) > 0) ? (Number(kitDetails?.mrp)- Number(kitDetails?.price)) : kitDetails?.price,
      useWalletPoint: discount,
      shippingCost: delivaryCharge,
      grandTotal: totalAmount,
      kit: kitDetails
    };
    responseWithData(
      res,
      200,
      true,
      "Billing Details Fetch Successfully",
      priceDetails
    );
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};

export const getInstructionByKitId = async (req,res) => {
  try {
    let customer = await authValues(req.headers["authorization"]);
    let kitType = (req?.body?.type == 'hair') ? 'hairKitId' : 'skinKitId';
    let kitDetails = await kit.findOne({ _id: customer?.[kitType] });
    // let kitDetails = await kit.findOne({ _id: "65c5e9878a8d3cc15a66612c" });
    if(kitDetails) {
      let finalInstruction = [];
      let kitOrder = await Order.findOne({customerId:customer?._id,isKit:true,kitId:kitDetails?._id,$or: [{ paymentMethod: 'cod'}, { paymentMethod: 'online', paymentStatus: 'paid'}]});
      let kitGenDate = (kitOrder?.updatedAt) ? new Date(kitOrder?.updatedAt) : new Date();
      kitGenDate.setDate(kitGenDate.getDate() - 1);
      let validity = (kitDetails?.validity) ? kitDetails?.validity : 30;
      let weekDayCount = 0;
      for(let i = 0; i < validity; i++) {
        let instructionDate = kitGenDate.setDate(kitGenDate.getDate() + 1);
        let dayWaiseData = {morning:[],night:[],anytime:[]};
        for(let kitProduct of kitDetails?.instruction) {
          let useByDay = kitProduct?.whenToUse?.split("/");
          let productData = await Product.findById(kitProduct?.productId);
          let useStatus = false;
          if(useByDay?.[0] == 2 || useByDay?.[0] == 3){
            useStatus = (weekDayCount == 0 || (1+Math.floor(7/useByDay?.[0]) == weekDayCount)) ? true : false;
          } else {
            useStatus = (useByDay?.[0] && (useByDay?.[0] > weekDayCount)) ? true  : false ;
          }
          let useInSIngleDay = 0;
          if(kitProduct?.morning_night?.includes('morning') && (!useByDay?.[1] || useByDay?.[0] > useInSIngleDay)) {
            dayWaiseData?.morning?.push({
              medicineTime:"morning",
              howToUse:kitProduct?.howToUse,
              step:kitProduct?.step,
              image:(kitProduct?.image) ? await getImageSingedUrlById(kitProduct?.image) : '',
              product:{...productData._doc ,thumbnail:await getImageSingedUrlById(productData?.thumbnail)},
              useStatus:useStatus
            });
            useInSIngleDay++;
          }
          if(kitProduct?.morning_night?.includes('night') && (!useByDay?.[1] || useByDay?.[0] > useInSIngleDay)) {
            dayWaiseData?.night?.push({
              medicineTime:"night",
              step:kitProduct?.step,
              howToUse:kitProduct?.howToUse,
              image:(kitProduct?.image) ? await getImageSingedUrlById(kitProduct?.image) : '',
              product:{...productData._doc ,thumbnail:await getImageSingedUrlById(productData?.thumbnail)},
              useStatus:useStatus
            });
            useInSIngleDay++;
          }
          if(kitProduct?.morning_night?.length == 0 || (!useByDay?.[1] || useByDay?.[0] > useInSIngleDay)) {
            dayWaiseData?.anytime?.push({
              medicineTime:"anytime",
              step:kitProduct?.step,
              howToUse:kitProduct?.howToUse,
              image:(kitProduct?.image) ? await getImageSingedUrlById(kitProduct?.image) : '',
              product:{...productData._doc ,thumbnail:await getImageSingedUrlById(productData?.thumbnail)},
              useStatus:useStatus
            });
            useInSIngleDay++;
          }
        }
        finalInstruction.push({instructionDate:new Date(instructionDate),dayWaiseData});
        weekDayCount++;
        if(weekDayCount == 7){
          weekDayCount = 0;
        }
      }
      return responseWithData(res,200,true,"Instruction Data get Successfully!!",finalInstruction);
    }
    return responseWithoutData(res,200,true,`You have reinstated ${req?.body?.type} chat please complete chat to get your kit !!`);
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
}
