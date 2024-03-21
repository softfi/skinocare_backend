import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, getAverageRating, getImageSingedUrlById, getSignedUrl, isCart, isTokenVerified, isWishlist, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import Product from "../../models/Product.js";
import RecentProduct from "../../models/RecentProduct.js";
import RecentSearch from "../../models/RecentSearch.js";

export const addOrUpdateRecentProduct = async (productId, userId) => {
    try {
        let checkRecentProduct = await RecentProduct.findOne({ productId: productId, userId: userId });
        if (checkRecentProduct != null) {
            await RecentProduct.findByIdAndUpdate(checkRecentProduct?._id, { $set: { createdAt: new Date() } });
        } else {
            await RecentProduct.create({
                productId: productId,
                userId: userId
            });
        }
        return true;
    } catch (error) {
        errorLog(error);
    }
}

export const recentProducts = async (req, res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        if (user == null) {
            return responseWithoutData(res, 403, false, "No User Found!!");
        }
        let recentProducts = await RecentProduct.aggregate([
            { $lookup: { from: "products", localField: "productId", foreignField: "_id", as: "product" } },
            { $match: { userId: user?._id } },
            { $sort: { updatedAt: -1 } }
        ]);
        var recentProduct = [];
        for (let i = 0; i < recentProducts.length; i++) {
            let product = recentProducts?.[i]?.product?.[0];
            let mrp = product?.price;
            if (product?.discountType == 'flat') {
                product.price = Number(mrp) - Number(product?.discount);
            } else if (product?.discountType == 'percent') {
                product.price = Number(mrp) - ((Number(mrp) * Number(product?.discount)) / 100);
            }
            recentProduct.push({ ...product, thumbnail: await getImageSingedUrlById(product?.thumbnail), mrp: mrp, averageRating: await getAverageRating(product?.id), isCart: (req.headers.hasOwnProperty('authorization') && await isTokenVerified(req.headers['authorization']))? await(isCart(await authValues(req.headers['authorization']),product._id)) : false, isWishlist:(req.headers.hasOwnProperty('authorization') && await isTokenVerified(req.headers['authorization']))? await(isWishlist(await authValues(req.headers['authorization']), product._id)) : false  });
        }
        if (recentProduct.length == 0) {
            return responseWithoutData(res, 404, false, "No Recently Viewed Product Found!!");
        }
        return responseWithData(res, 200, true, "Recently Viewed Product Fetch Successfully!!", recentProduct);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const recentSearch = async (req, res) => {
    try {
        let customer = await authValues(req.headers['authorization']);
        let recentSearches = await RecentSearch.find({ customerId: customer._id }).select('searchTxt slug').sort({ createdAt: -1 });
        responseWithData(res, 200, true, "Recent Searches Fetch Successfully", recentSearches);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const recentSearchStore = async (req, res) => {
    try {
        let product = await Product.findOne({ slug: req.body.slug });
        let customer = await authValues(req.headers['authorization']);
        if (product) {
            let recentSearches = await RecentSearch.find({ customerId: customer._id }).sort({ date: -1 });
            let recentMatch = await RecentSearch.findOne({ searchTxt: product.name });
            if(recentMatch){
                await RecentSearch.deleteOne({ _id: recentMatch._id });
            }
            else if (recentSearches.length >= 6) {
                await RecentSearch.deleteOne({ _id: recentSearches[0]._id });
            }
            let recentsearch = await RecentSearch.create({
                customerId: customer._id,
                searchTxt: product.name,
                slug: req.body.slug,
            });
            if (recentsearch) {
                responseWithoutData(res, 200, true, "Slug Store Successfully");
            } else {
                responseWithoutData(res, 201, false, "Fail to Store Slug");
            }
        } else {
            responseWithoutData(res, 201, false, "Slug Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const clearRecentSearch = async(req, res)=>{
    try {
        let customer = await authValues(req.headers['authorization']);
        let result = await RecentSearch.deleteMany({ customerId: customer._id });
        if(result){
            return responseWithoutData(res, 200, true, "Recent Searches Deleted Successfully");
        }
        return responseWithoutData(res, 201, false, "Fail to Delete Recent Searches");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}