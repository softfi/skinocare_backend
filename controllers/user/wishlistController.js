import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, getAverageRating, getImageSingedUrlById, isStock, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import Product from "../../models/Product.js";
import Wishlist from "../../models/Wishlist.js";

export const addWishlist = async (req, res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        let checkWislist = await Wishlist.findOne({customerId:user?._id,productId: req?.params?.productId});
        if(checkWislist){
            return responseWithoutData(res, 500, false, "Product is already in your Wishlist");
        }
        let wishlist = await Wishlist.create({
            productId       : req?.params?.productId,
            customerId      : user?._id
        });
        console.log(wishlist);
        if(wishlist){
            return responseWithoutData(res, 200, true, "Product added to Wishlist Successfullly");
        }else{
            return responseWithoutData(res, 400, false, "Failed to add in Wishlist");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const wishlist = async (req, res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        // let totalData = await Wishlist.countDocuments({ customerId : user?._id });
        // let numberOfItems = 12;
        // let currentPage = Number(req?.body?.pageNumber ?? 1);
        let wishlists = await Wishlist.find({ customerId:user._id });
        let wishlistData = [];
        for(let wishlist of wishlists) {
            let product = await Product.findOne({_id: wishlist.productId });
            if(product){
            wishlistData.push({...wishlist._doc , name : product?.name,thumbnail: await getImageSingedUrlById(product?.thumbnail),slug: product?.slug,price:product?.price,mrp:product?.mrp,description:product?.description, isStock: await isStock(product._id, 1), averageRating:await getAverageRating(product._id), rating:product.rating, discountType:product.discountType,discount:product.discount});
        }
        }
        responseWithData(res, 200, true, "Wishlist Fetch Successfully", wishlistData);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const removeWishlist = async (req, res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        let wishlist = await Wishlist.findOne({customerId:user?._id, productId:req?.params?.productId});
        if(wishlist){
            if(await Wishlist.findByIdAndDelete(wishlist._id)){
                return responseWithoutData(res, 200, true, "Product Deleted to Wishlist Successfullly");
            }else{
                return responseWithoutData(res, 400, false, "Failed to delete from Wishlist");
            }
        }
        else{
            return responseWithoutData(res, 404, false, "Product Not Found In Wishlist");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}