import { errorLog } from "../config/logger.js";
import { errorResponse, responseWithData, getSignedUrl, getImageSingedUrlById, responseWithoutData, authValues, isTokenVerified, appliedCouponValue, getAverageRating, isCart, isWishlist, uploadToS3, base64toimageAndUploadToServer } from "../helpers/helper.js";
import Product from "../models/Product.js";
import Testimonial from "../models/Testimonial.js";
import Faq from "../models/Faq.js";
import Categroy from "../models/Categroy.js";
import Doctor from "../models/Doctor.js";
import Upload from "../models/Upload.js";
import { addOrUpdateRecentProduct } from "./user/recentController.js";
import Review from "../models/Review.js";
import Cart from "../models/Cart.js";
import Wishlist from "../models/Wishlist.js";
import Setting from "../models/Setting.js";
import CaseStudy from "../models/CaseStudy.js";
import RecentSearch from "../models/RecentSearch.js";
import Page from "../models/Page.js";
import SkinocareJourney from "../models/SkinocareJourney.js";
import SkinAndHair from "../models/SkinAndHair.js";
import User from "../models/User.js";
import DoctorDetail from "../models/DoctorDetail.js";
import { uploadsPath } from "../config/config.js";
import fs from 'fs';
import SkinAnalysisNew from "../models/SkinAnalysisNew.js";
import Plan from "../models/Plan.js";



export const getProducts = async (req, res) => {
    try {
        // console.log(req.params.pageNumber, req.body.sortBy, req.body.categoryId); // Working On SortedBy
        if (req.body.category?.length > 0 || req.body.concern?.length > 0 || req.body.product?.length > 0 || req.body.sort?.length > 0 || req.body.price?.length > 0 || req.body.offers?.length > 0) {
            let categoryIds = [];
            req.body?.category.length > 0 ? categoryIds = categoryIds.concat(req.body?.category) : '';
            req.body?.concern.length ? categoryIds = categoryIds.concat(req.body?.concern) : '';
            req.body?.product.length > 0 ? categoryIds = categoryIds.concat(req.body?.product) : '';
            
            let numberOfItems = 12;
            // let totalPages = Math.ceil(countOfDocument / numberOfItems);
            let currentPage = Number(req.body.pageNumber ?? 1);
            let products = [];
            let totalData = 0;
            let sorting = req.body.sort.toUpperCase() === "A-Z" ? {"name": 1} : (req.body.sort.toUpperCase() === "Z-A" ? {"name": -1} : (req.body.sort.toUpperCase() === "L-H" ? {"price": 1} : (req.body.sort.toUpperCase() === "H-L" ? {"price": -1}: {}))) // // "A-Z","Z-A","L-H","H-L"
            let priceMinMax = {};
            let offersMinMax = {};
            if(req.body.price?.length > 0){
                priceMinMax = {
                    price : { $lte: Number(req.body.price.split("-")[1]), $gte: Number(req.body.price.split("-")[0]) }
                    }
            }
            if(req.body.offers?.length > 0){
                offersMinMax = {
                    discount : { $lte: Number(req.body.offers[1]), $gte :  Number(req.body.offers[0]) },
                    }
            }
            if(categoryIds.length > 0){
                totalData = await Product.countDocuments({ isActive: true, isDeleted: false, categoryId: { $in: categoryIds }, ...priceMinMax, ...offersMinMax });
                products = await Product.find({ isActive: true, isDeleted: false, categoryId: { $in: categoryIds }, ...priceMinMax, ...offersMinMax }).sort(sorting).skip(numberOfItems * (currentPage - 1)).limit(numberOfItems);
            }else{
                totalData = await Product.countDocuments({ isActive: true, isDeleted: false, ...priceMinMax, ...offersMinMax});
                products = await Product.find({ isActive: true, isDeleted: false, ...priceMinMax, ...offersMinMax }).sort(sorting).skip(numberOfItems * (currentPage - 1)).limit(numberOfItems);
            }
            let productList = [];
            for (let i = 0; i < products.length; i++) {
                let product = products?.[i];
                let averageRating = await Review.aggregate([
                    {$match:{productId:product?._id}},
                    {$group:{_id: null,avgRating: { $avg: "$rating" }}}
                ]);
                productList.push({ ...product._doc, thumbnail: await getImageSingedUrlById(product?.thumbnail),averageRating:(averageRating.length>0) ? averageRating?.[0]?.avgRating : 0, isCart: (req.headers.hasOwnProperty('authorization') && await isTokenVerified(req.headers['authorization']))? await(isCart(await authValues(req.headers['authorization']),product._id)) : false, isWishlist:(req.headers.hasOwnProperty('authorization') && await isTokenVerified(req.headers['authorization']))? await(isWishlist(await authValues(req.headers['authorization']), product._id)) : false });
            }
            responseWithData(res, 200, true, "Product List Filtered Successfully", { totalData, productList });
        }
        else if(!req.body?.searchValue==""){
            let totalData = await Product.countDocuments({name: { $regex: req.body.searchValue }, isDeleted: false});
            if(req.headers.hasOwnProperty('authorization') && await isTokenVerified(req.headers['authorization'])){
                let customer = await authValues(req.headers['authorization']);
                let recentSearches = await RecentSearch.find({ customerId: customer._id }).sort({date:-1});
                let recentMatch = await RecentSearch.findOne({ searchTxt: req?.body?.searchValue });
                if(recentMatch){
                    await RecentSearch.deleteOne({ _id: recentMatch._id });
                }
                else if (recentSearches.length >= 6) {
                    await RecentSearch.deleteOne({ _id: recentSearches[0]._id });
                }
                RecentSearch.create({
                    customerId : customer._id,
                    searchTxt : req.body.searchValue,
                });
            }
            let numberOfItems = 12;
            // let totalPages = Math.ceil(countOfDocument / numberOfItems);
            let currentPage = Number(req.body.pageNumber ?? 1);
            let products = await Product.find({name: { $regex: req.body.searchValue }, isDeleted: false}).skip(numberOfItems * (currentPage - 1)).limit(numberOfItems);
            let productList = []; // Need to changes
            for (let i = 0; i < products.length; i++) {
                let product = products?.[i];
                let averageRating = await Review.aggregate([
                    {$match:{productId:product?._id}},
                    {$group:{_id: null,avgRating: { $avg: "$rating" }}}
                ]);
                productList.push({ ...product._doc, thumbnail: await getImageSingedUrlById(product?.thumbnail), averageRating:(averageRating.length>0) ? averageRating?.[0]?.avgRating : 0, isCart: (req.headers.hasOwnProperty('authorization') && await isTokenVerified(req.headers['authorization']))? await(isCart(await authValues(req.headers['authorization']),product._id)) : false, isWishlist:(req.headers.hasOwnProperty('authorization') && await isTokenVerified(req.headers['authorization']))? await(isWishlist(await authValues(req.headers['authorization']), product._id)) : false });
            }
            responseWithData(res, 200, true, "Product List Fetch Successfully", { totalData, productList });
        }
        else {
            let totalData = await Product.countDocuments({ isActive: true, isDeleted: false });
            let numberOfItems = 12;
            // let totalPages = Math.ceil(countOfDocument / numberOfItems);
            let currentPage = Number(req.body.pageNumber ?? 1);
            let products = await Product.find({ isActive: true, isDeleted: false }).sort({createdAt:-1}).skip(numberOfItems * (currentPage - 1)).limit(numberOfItems);
            let productList = []; // Need to changes
            for (let i = 0; i < products.length; i++) {
                let product = products?.[i];
                let averageRating = await Review.aggregate([
                    {$match:{productId:product?._id}},
                    {$group:{_id: null,avgRating: { $avg: "$rating" }}}
                ]);
                productList.push({ ...product._doc, thumbnail: await getImageSingedUrlById(product?.thumbnail),averageRating:(averageRating.length>0) ? averageRating?.[0]?.avgRating : 0, isCart: (req.headers.hasOwnProperty('authorization') && await isTokenVerified(req.headers['authorization']))? await(isCart(await authValues(req.headers['authorization']),product._id)) : false, isWishlist:(req.headers.hasOwnProperty('authorization') && await isTokenVerified(req.headers['authorization']))? await(isWishlist(await authValues(req.headers['authorization']), product._id)) : false });
            }
            responseWithData(res, 200, true, "Product List Fetch Successfully", { totalData, productList });
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const productSuggestion = async (req, res)=>{
    try {
        let suggestions = await Product.find({
            name: { $regex: new RegExp(req.body.value, 'i') },
            isDeleted: false
          }).select('name slug');
        responseWithData(res, 200, true, "Suggestion Fetch Successfully", suggestions)
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getTestimonials = async (req, res) => {
    try {
        let testimonials = await Testimonial.find({ isActive: true, isDeleted: false }).select('name image age title description address createdAt');
        let testimonialList = [];
        for (let testimonial of testimonials) {
            testimonialList.push({ ...testimonial._doc, image:await getImageSingedUrlById(testimonial?.image), rating: (testimonial?._doc?.rating) ? testimonial?._doc?.rating : 4.5 });
        }
        responseWithData(res, 200, true, "Testimonial List Fetch Successfully", testimonialList);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getfaqs = async (req, res) => {
    try {
        let query = { isActive: true, isDeleted: false };
        let categories = await Categroy.find({ ...query, type: "faq" }).select('name image');
        let faqList = [];
        for (let i = 0; i < categories.length; i++) {
            let category = categories?.[i];
            query = { ...query, categoryId: category?._id?.toString() };
            let faqsData = await Faq.find({ ...query }).select('question answer likes disLikes');
            let faqs = []
           for(let faq of faqsData){
            let likes = faq?.likes ? faq.likes.length : 0; 
            const disLikes = faq?.disLikes ? faq.disLikes.length : 0;
            faqs.push({...faq._doc, likes:likes, disLikes:disLikes});
           }
            faqList.push({ name: category?.name, faqs: faqs, image: await getImageSingedUrlById(category?.image) });
        }
        responseWithData(res, 200, true, "Faq List Fetch Successfully", faqList);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}



export const faqCategories = async (req, res) => {
    try {
        let query = { isActive: true, isDeleted: false, type: "faq" };
        let categories = await Categroy.find({ ...query }).select('name image');
        let faqCategories = [];
        for (let i = 0; i < categories.length; i++) {
            let faq = categories?.[i];
            faqCategories.push({ ...faq._doc, image: await getImageSingedUrlById(faq?.image)});
        }
        responseWithData(res, 200, true, "Faq Categories List Fetch Successfully", faqCategories);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getProductBySlug = async (req, res) => {
    try {
        if (req?.params?.slug == undefined || req?.params?.slug == null || req?.params?.slug == '') {
            return responseWithData(res, 500, false, "productId field is Required!!", {});
        }
        let product = await Product.findOne({ slug: req?.params?.slug, isActive: true, isDeleted: false });
        if (product == null) {
            return responseWithData(res, 404, false, "No Product Found!!", {});
        }
        if(req.headers.hasOwnProperty('authorization')){
            let response = await isTokenVerified(req.headers['authorization']);
            if(!response){
                return responseWithoutData(res, 403, false, "Token Invalid");
            }
        }
        let isCart = false;
        let isWishlist = false;
        if(req.headers['authorization'] != undefined && req.headers['authorization'] != null && req.headers['authorization'] != ''){
            let user = await authValues(req.headers['authorization']);
            if(user != null){
                let cart = await Cart.findOne({productId:product?._id,customerId:user?._id});
                let wishlist = await Wishlist.findOne({productId:product?._id,customerId:user?._id});
                isCart = (cart) ? true : false;
                isWishlist = (wishlist) ? true : false;
                await addOrUpdateRecentProduct(product?._id,user?._id);
            }  
        }
        let images = [];
        for (let i = 0; i < product?.images?.length; i++) {
            images.push(await getImageSingedUrlById(product?.images?.[i]));
        }
        let averageRating = await Review.aggregate([
            {$match:{productId:product?._id}},
            {$group:{_id: null,avgRating: { $avg: "$rating" }}}
        ]);
        product = { ...product._doc, thumbnail: await getImageSingedUrlById(product?.thumbnail), images: images,isCart:isCart,isWishlist:isWishlist,averageRating:(averageRating.length>0) ? averageRating?.[0]?.avgRating : 0}
        responseWithData(res, 200, true, "Product Details Fetch Successfully", product);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const getRelatedProducts = async (req, res) => {
    try {
        let categories = await Product.findOne({ slug: req.params.slug, isDeleted: false }).select('categoryId');
        if (categories) {
            let products = await Product.find({ "categoryId": { $elemMatch: { $in: categories.categoryId } }, isDeleted: false }).select('slug name price mrp thumbnail description rating').limit(10);
            let productList = [];
            for (let i = 0; i < products.length; i++) {
                let product = products?.[i];
                productList.push({ ...product._doc, thumbnail: await getImageSingedUrlById(product?.thumbnail), rating:(product?.rating), isCart: (req.headers.hasOwnProperty('authorization') && await isTokenVerified(req.headers['authorization']))? await(isCart(await authValues(req.headers['authorization']),product._id)) : false, isWishlist:(req.headers.hasOwnProperty('authorization') && await isTokenVerified(req.headers['authorization']))? await(isWishlist(await authValues(req.headers['authorization']), product._id)) : false });
            }
            if (productList.length > 0) {
                responseWithData(res, 200, true, "Related Products Fetch Successfully", productList);
            } else {
                responseWithoutData(res, 201, false, "Related Products Not Found");
            }
        } else {
            responseWithoutData(res, 201, false, "Product Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const getFilter = async(req , res)=>{
    try {
        let categories = await Categroy.find({ type:'category', isDeleted: false }).select('_id name type');
        let concern = await Categroy.find({ type:'concern', isDeleted: false }).select('_id name type');
        let productType = await Categroy.find({ type:'productType', isDeleted: false }).select('_id name type');
        let sort = await Categroy.find({ type:'sort', isDeleted: false }).select('_id name type');
        let msg = "Data Fetch Successfully.";
        responseWithData(res, 200, true, msg, {categories, concern, productType, sort})
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}   

export const reviews = async(req , res)=>{
    try {
        let product = await Product.findOne({slug:req?.params?.productSlug});
        if(product == null){
            return responseWithoutData(res, 404, false, "No Product Found!!");
        } 
        let reviews = await Review.aggregate([
            {$addFields: {'productId': { '$toString': '$productId' }}},
            {$lookup:{from:"users",localField:"customerId",foreignField:"_id",as:"user"}},
            {$match:{isActive:true,productId:product?._id}}
        ]);
        let list = [];
        let averageRating = 0;
        for(let i=0; i<reviews.length;i++) {
            let r = reviews?.[i];
            let user = r?.user?.[0];
            list.push({userName:user?.name,image:(user?.image != null) ? await getImageSingedUrlById(user?.image): '',rating:r?.rating,comment:r?.comment,date:r?.updatedAt})
            averageRating += Number(r?.rating);
        }
        if(reviews.length > 0){
            averageRating = Number(averageRating)/Number(list.length);
            return responseWithData(res, 200, true, "Review List Fetch Successfully!!", {list:list,averageRating:averageRating,totalCount:list.length});
        }
        return responseWithData(res, 404, false, "No Reviews Found!!", {});
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
} 


export const applyCoupon = async (req,res) => {
    try {
        let customer = await authValues(req.headers['authorization']);
        const {couponCode,totalAmount} = req?.body;
        let discountAmount =  await appliedCouponValue(couponCode,totalAmount, res, customer._id);
        return responseWithData(res, 200, true, "Discount Applied Successfully!!",{discountAmount:Number(Number(discountAmount).toFixed(2))});
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getSettingByType = async(req, res)=>{
    try {
        let type = req?.params?.type;
        let setting = await Setting.findOne({ type:type });
        if(setting){
            // Custom Change For general_settings
            if(type==="referral_amount" || type==="general_settings" || type==="shipping_method" || type==="payment_method" || type==="clear_doubts"){
                if(type==="general_settings"){
                    setting.value[0].logo = await getImageSingedUrlById(setting.value[0].logo);
                }
                responseWithData(res, 200, true, "Value Fetch Successfully", setting.value[0]);
            }else{
                responseWithData(res, 200, true, "Value Fetch Successfully", setting.value);
            }
        }else{
            responseWithoutData(res, 404, false, "Type is Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getCaseStudiesList = async(req, res)=>{
    try {
        let caseStudies = await CaseStudy.find({ isDeleted:false });
        let caseStudiesList = [];
        for (let caseStudy of caseStudies) {
            caseStudiesList.push({...caseStudy._doc, image:await getImageSingedUrlById(caseStudy?.imageId)});
        }
        responseWithData(res, 200, true, "Case Studies List Fetch Successfully!", caseStudiesList);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getCaseStudyById = async(req, res)=>{
    try {
        let caseStudy = await CaseStudy.findOne({ _id:req?.body?.caseStudyId , isDeleted:false });
        if(caseStudy){
            responseWithData(res, 200, true, "Case Study Found Successfully", caseStudy);
        }else{
            responseWithoutData(res, 201, true, "Case Study Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const skinocareJourney = async(req, res)=>{
    try {
        let skinocareJournies = await SkinocareJourney.find({ isActive: true, isDeleted: false }).select("name videoLink");
        responseWithData(res, 200, true, "SkinOCare Journies Fetch Successfully", skinocareJournies);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const doctorList = async(req, res)=>{
    try {
        let doctors = await Doctor.find({ isActive: true, isDeleted: false }).select("image name experties patientHandled shortDescription description");
        let docterList = [];
        for (let i = 0; i < doctors.length; i++) {
            docterList.push({ ...doctors[i]._doc, image: await getImageSingedUrlById(doctors[i].image) })
        }
        responseWithData(res, 200, true, "Doctor List Fetch Successfully", docterList);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const pageList = async(req, res)=>{
    try {
        let pageList = await Page.find({ isActive:true, isDeleted:false }).select("name slug content");
        responseWithData(res, 200, true,"Page List Fetch Successfully", pageList);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getPageBySlug = async(req, res)=>{
    try {
        let page = await Page.findOne({ slug:req.params.slug, isActive:true, isDeleted:false }).select("name slug content");
        if(page){
            responseWithData(res, 200, true, "Page Fetch Successfully", page);
        }else{
            responseWithoutData(res, 404, false, "Page Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const getSkinAndHairSearch = async(req, res)=>{
    try {
        let filter = {
            isActive:true,
            isDeleted: false
        }
        if(req.body.text){
           filter.name = { $regex: new RegExp(req.body.text, 'i')};
        }
        if(req.body.type){
            filter.type = req.body.type ;
        }
        let skinAndHairs = await SkinAndHair.find(filter).select("name topic upload uploadType type addedBy isActive");
        let skinAndHairList = [];
        for(let skinAndHair of skinAndHairs){
            if(skinAndHair.uploadType === "image"){
                skinAndHair.upload = await getImageSingedUrlById(skinAndHair.upload)
                skinAndHairList.push({ ...skinAndHair._doc});
            }else{
                skinAndHairList.push({ ...skinAndHair._doc });
            }
        }
        return responseWithData(res, 200, true, "List Filter Successfully",skinAndHairList);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getMobileDoctorList = async(req, res)=>{
        try {
            let doctors = await DoctorDetail.find({ isDeleted:false });
            let doctorList = [];
            for (let doctor of doctors) {
                doctorList.push({ ...doctor._doc, image: await getImageSingedUrlById(doctor.image) })
            }
            responseWithData(res, 200, true, "Docter List Fetch Successfully", doctorList);
        } catch (error) {
            errorLog(error);
            errorResponse(res);
        }
}
export const getMobileDoctorDetails = async(req, res)=>{
    try {
        let doctorDetail = await DoctorDetail.findOne({ _id:req.params.doctorId }).populate({
            path: 'designation',
            select: 'designation -_id' 
          });
        if(doctorDetail){
            let image = await getImageSingedUrlById(doctorDetail?.image?.toString());
            doctorDetail = {...doctorDetail._doc,image:image ,  designation: doctorDetail?.isHod == true ? "Head Of Dermotology" : doctorDetail?.designation?.designation };
            return responseWithData(res, 200, true, "Doctor Details Fetch Successfully", doctorDetail);
        }
        return responseWithoutData(res, 404, false, "Doctor Not Found");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}
 export const  categoriesDoctorList = async(req, res)=>{
    try {
        let doctors = await DoctorDetail.find({ isDeleted:false, isActive : true}).populate({
            path: 'designation',
            select: 'designation -_id' 
          });
        let doctorList = [];
        for (let doctor of doctors) {
            doctorList.push({ ...doctor._doc, image: await getImageSingedUrlById(doctor.image),  designation: doctor?.isHod == true ? "Head Of Dermotology" : doctor?.designation?.designation })
        }
        responseWithData(res, 200, true, "Docter List Fetch Successfully", {doctorList});
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
 }

export const imageProcessNew = async (req,res) => {
    try {
        if (!req.file || Object.keys(req.file).length === 0) {
            return responseWithoutData(res,201,false,"No image has been selected!");
        }
        let userId = '64fb0bd2c140c24a57962cb2';
        const uploadedFile = req?.file; // 'file' is the name attribute in the form
        const getExtansion = uploadedFile?.originalname?.split(".");
        const fileName = `image-analysis-${(new Date()).getTime()}.${getExtansion?.[(getExtansion.length-1)]}`;
        let filePath = await uploadsPath(req?.body?.type);
        fs.writeFileSync(`uploads/skin_analysis/${fileName}`, uploadedFile.buffer);
        await uploadToS3(`${fileName}`, filePath, uploadedFile.buffer);
        let uploadImage = await Upload.create({
            fileName: fileName,
            filePath: filePath,
            relatedWith: req.body.type,
            addedBy: userId,
        });
        if(uploadImage){
            let apiResponse = fs.readFileSync('./testFace1.json','utf8'); 
            apiResponse = JSON.parse(apiResponse);
            let imagePath = './uploads/skin_report/';
            let analysisReportResult = {};
            analysisReportResult.brown_area = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.brown_area,imagePath+'brown_area.png',userId);
            analysisReportResult.red_area = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.red_area,imagePath+'red_area.png',userId);
            analysisReportResult.roi_outline_map = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.roi_outline_map,imagePath+'roi_outline_map.png',userId);
            analysisReportResult.rough_area = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.rough_area,imagePath+'rough_area.png',userId);
            analysisReportResult.texture_enhanced_blackheads = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.texture_enhanced_blackheads,imagePath+'texture_enhanced_blackheads.png',userId);
            analysisReportResult.texture_enhanced_bw = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.texture_enhanced_bw,imagePath+'texture_enhanced_bw.png',userId);
            analysisReportResult.texture_enhanced_lines = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.texture_enhanced_lines,imagePath+'texture_enhanced_lines.png',userId);
            analysisReportResult.texture_enhanced_oily_area = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.texture_enhanced_oily_area,imagePath+'texture_enhanced_oily_area.png',userId);
            analysisReportResult.texture_enhanced_pores = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.texture_enhanced_pores,imagePath+'texture_enhanced_pores.png',userId);
            analysisReportResult.water_area = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.water_area,imagePath+'water_area.png',userId);
            analysisReportResult.customerId = userId;
            let saveResult = await SkinAnalysisNew.create({
                ...analysisReportResult,
                status:true,
                frontFaceImage: uploadImage?._id
            });
            let skinAnalysisReportData = {
                uploadedImageFront     :      (uploadImage) ? await getImageSingedUrlById(uploadImage?._id) : null,
                uploadedImageLeft      :      null,
                uploadedImageRight     :      null,
                analysisResult         :      [
                    {
                        problem   :    'Brown Area',
                        image     :    (saveResult?.brown_area) ? await getImageSingedUrlById(saveResult?.brown_area) : null
                    },
                    {
                        problem   :    'Red Area',
                        image     :    (saveResult?.red_area) ? await getImageSingedUrlById(saveResult?.red_area) : null
                    },
                    {
                        problem   :    'Roi Outline Map',
                        image     :    (saveResult?.roi_outline_map) ? await getImageSingedUrlById(saveResult?.roi_outline_map) : null
                    },
                    {
                        problem   :    'Rough Area',
                        image     :    (saveResult?.rough_area) ? await getImageSingedUrlById(saveResult?.rough_area) : null
                    },
                    {
                        problem   :    'Texture Enhanced Blackheads',
                        image     :    (saveResult?.texture_enhanced_blackheads) ? await getImageSingedUrlById(saveResult?.texture_enhanced_blackheads) : null
                    },
                    {
                        problem   :    'Texture Enhanced bw',
                        image     :    (saveResult?.texture_enhanced_bw) ? await getImageSingedUrlById(saveResult?.texture_enhanced_bw) : null
                    },
                    {
                        problem   :    'Texture Enhanced Lines',
                        image     :    (saveResult?.texture_enhanced_lines) ? await getImageSingedUrlById(saveResult?.texture_enhanced_lines) : null
                    },
                    {
                        problem   :    'Texture Enhanced Oily Area',
                        image     :    (saveResult?.texture_enhanced_oily_area) ? await getImageSingedUrlById(saveResult?.texture_enhanced_oily_area) : null
                    },
                    {
                        problem   :    'Texture Enhanced Pores',
                        image     :    (saveResult?.texture_enhanced_pores) ? await getImageSingedUrlById(saveResult?.texture_enhanced_pores) : null
                    },
                    {
                        problem   :    'Water Area',
                        image     :    (saveResult?.water_area) ? await getImageSingedUrlById(saveResult?.water_area) : null
                    },
                ]
            };
            return responseWithData(res, 200, true, "Image Analysis Report Get Successfully!!", { skinAnalysisReportData });
        }else{
            return responseWithoutData(res, 201, false, "Something Went Wrong!!");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const getPlanByKitId = async (req,res) => {
    try {
        let plans = await Plan.find({kitId:req?.body?.kitId,isDeleted:false});
        if(plans.length > 0) {
            let planList = [];
            for(let plan of plans){
                planList.push({...plan._doc,image:await getImageSingedUrlById(plan?.image)});
            }
            // let planList = {advance:[],pro:[],assist:[]};
            // for(let plan of plans){
            //     if(plan.type == 'Advance'){
            //         planList.advance.push({...plan._doc,image:await getImageSingedUrlById(plan?.image)});
            //     } else if(plan.type == 'Pro') {
            //         planList.pro.push({...plan._doc,image:await getImageSingedUrlById(plan?.image)});
            //     } else if(plan.type == 'Assist') {
            //         planList.assist.push({...plan._doc,image:await getImageSingedUrlById(plan?.image)});
            //     }
            // }
            return responseWithData(res, 200, true, "Kit Plan get Successfully!!",  planList );
        } else {
            return responseWithoutData(res, 201, false, "No Record Found!!");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}