import  express from "express";
import morgan from "morgan";
import { getProducts, getTestimonials, getfaqs, faqCategories, getProductBySlug, getRelatedProducts, getFilter, reviews, applyCoupon, getSettingByType, getCaseStudiesList, getCaseStudyById, productSuggestion, skinocareJourney, doctorList, pageList, getPageBySlug, getMobileDoctorList, getMobileDoctorDetails, getSkinAndHairSearch, imageProcessNew, categoriesDoctorList } from "../controllers/webController.js";
import { callback_url } from "../controllers/user/phonepeController.js";
import { body, param } from "express-validator";
import { uploadImageValdator, userValidation } from "../validation/userValidation.js";
import { multerImageUpload } from "../config/config.js";
export const webRoute = express.Router();

/* Middleware For Creating Console Log of Routes*/
webRoute.use(morgan('dev'));

/*****************************
 ******** WEB ROUTES *********
 ****************************/


 /* PRODUCTS ROUTE START */

webRoute.post('/products', [ body('categoryId').optional(), 
        body('concern').optional(),
        body('searchValue').optional(),
        body('category').optional(),
        body('product').optional(),
        body('sortBy').optional().custom(async(sortBy)=>{
            if(sortBy === 'Popularity'|| sortBy === 'New Arrivals'||sortBy === 'Best Sellers'||sortBy === 'Featured'||sortBy === 'A-Z'||sortBy === 'Z-A'){
                return true;
            }
            else{
                throw new Error("Sort By Should have Some Selected Values");
            }
        })] , getProducts);

webRoute.get('/products/:slug',getProductBySlug);

webRoute.post('/product/suggestion', [ body('value').notEmpty().withMessage('Value field is Required').isString().withMessage('Value Must be String') ] , userValidation, productSuggestion)

 /* PRODUCTS ROUTE END */

 /* TESTIMONIALS ROUTE START */

 webRoute.get('/testimonials', getTestimonials);

 /* TESTIMONIALS ROUTE END */

 /* FAQ ROUTE START */

 webRoute.get('/faqCategories', faqCategories);
 webRoute.get('/faqs', getfaqs);
 /* FAQ ROUTE END */

/* RELATED PRODUCT ROUTE START */

webRoute.get('/related-products/:slug', getRelatedProducts);

/* RELATED PRODUCT ROUTE END */

/* CATEGORY PRODUCT ROUTE START */

webRoute.get('/filter', userValidation , getFilter);

/* CATEGORY PRODUCT ROUTE END */ 

/* REVIEW PRODUCT ROUTE START */

webRoute.get('/reviews/:productSlug',[
    param('productSlug').notEmpty().withMessage('Product Slug field is Required'),
], userValidation , reviews); 

/* REVIEW PRODUCT ROUTE END */ 


/* SETTING ROUTE START */

webRoute.get('/settings/:type', getSettingByType); 

/* SETTING ROUTE END */ 

/* CASE STUDIES ROUTE START */

webRoute.get('/case-study', getCaseStudiesList); 

webRoute.post('/case-study', [
    body('caseStudyId').notEmpty().withMessage('Case Study Id Field is Required'),
],userValidation ,getCaseStudyById); 

/* CASE STUDIES ROUTE END */ 

/* SKINOCARE JOURNEY ROUTE START */

webRoute.get('/skinocare-journey', skinocareJourney);

/* SKINOCARE JOURNEY ROUTE END */


/* DOCTOR ROUTE START */

webRoute.get('/doctor', doctorList);

webRoute.get('/doctor/list', getMobileDoctorList);

webRoute.get('/doctor/details/:doctorId', getMobileDoctorDetails);

webRoute.get('/doctor-list', categoriesDoctorList);

/* DOCTOR ROUTE END */

/* PAGES ROUTE START */

webRoute.get('/pages', pageList);

webRoute.get('/pages/:slug', getPageBySlug);

/* PAGES ROUTE END */

/* PHONEPE ROUTE START */

webRoute.get('/phonepe/callback-url/:orderId', callback_url);

/* PHONEPE ROUTE END */

/* PHONEPE ROUTE START */

webRoute.post('/skin-and-hair/search', getSkinAndHairSearch);

/* PHONEPE ROUTE END */

webRoute.post('/image-process-new-api', multerImageUpload.single('image'), uploadImageValdator,imageProcessNew); 

