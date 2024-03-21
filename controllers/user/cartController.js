import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, getAverageRating, getImageSingedUrlById, isStock, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";


export const getCartList = async (req, res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        let cartDetails = await Cart.find({ customerId: user._id }).select('productId quantity');
        var cartList = [];
        for (let i = 0; i < cartDetails.length; i++) {
            var cartDetail = cartDetails?.[i];
            let product = await Product.findById(cartDetail.productId);
            cartList.push({ cardId: cartDetail?._id, productId: product?._id, name: product?.name, slug: product?.slug, thumbnail: await getImageSingedUrlById(product?.thumbnail), description: product?.description, price: product?.price, mrp: product?.mrp, quantity: cartDetail?.quantity, isStock: await isStock(cartDetail.productId, cartDetail.quantity), averageRating: await getAverageRating(cartDetail.productId),discountType: product.discountType, discount:product.discount,rating:product.rating })
        }
        responseWithData(res, 200, true, "Cart List Fetch Successfully", cartList);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const addToCart = async (req, res) => {
    try {
        if (await isStock(req.body.productId, req.body.quantity)) {
            let user = await authValues(req.headers['authorization']);
            let cart = await Cart.findOne({ customerId: user._id, productId: req.body.productId });
            if (!cart) {
                let cart = await Cart.create({
                    customerId: user._id,
                    productId: req.body.productId,
                    quantity: req.body.quantity
                });
                if (cart) {
                    responseWithoutData(res, 200, true, "Product Added in Cart");
                } else {
                    responseWithoutData(res, 403, false, "Failed to Add Product in Cart");
                }
            } else {
                responseWithoutData(res, 403, false, "Product Already in Cart");
            }
        }
        else {
            responseWithoutData(res, 400, false, "Product Stock is Exceeded");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const updateCart = async (req, res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        let cart = await Cart.findOne({ _id: req.body.cartId, customerId: user._id });
        if (cart) {
        if (await isStock(cart?.productId, req.body.quantity)) {
                let updatedCart = null
                if(req.body.quantity > 0){
                    updatedCart = await Cart.findByIdAndUpdate(req.body.cartId, {
                        quantity: req.body.quantity
                    }, { new: true });
                }else{
                    updatedCart = await Cart.deleteOne({ _id :req.body.cartId });
                }
                if (updatedCart) {
                    responseWithoutData(res, 200, true, "Cart Item Updated Successfully");
                } else {
                    responseWithoutData(res, 403, false, "Failed to Update Item from Cart");
                }
            }
            else {
                responseWithoutData(res, 400, false, "Product Stock is Exceeded");
            }
        } else {
            responseWithoutData(res, 404, false, "Cart Item Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const removeFromCart = async (req, res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        let cart = await Cart.findOne({ _id: req.body.cartId, customerId: user._id });
        if (cart) {
            let removeCart = await Cart.findByIdAndDelete(req.body.cartId);
            if (removeCart) {
                responseWithoutData(res, 200, true, "Cart Item Deleted Successfully");
            } else {
                responseWithoutData(res, 403, false, "Failed to Delete Item from Cart");
            }
        } else {
            responseWithoutData(res, 404, false, "Cart Item Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}