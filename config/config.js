import nodemailer from "nodemailer";
import multer from "multer";
import AWS from "aws-sdk";
import "dotenv/config";

/***************************************
    PORT & APPLICATION CONFIGRATIONS
***************************************/

export const APP_ENV = process.env.hasOwnProperty('APP_ENV') ? process.env.APP_ENV : 'local';
export const PORT = process.env.hasOwnProperty('PORT') ? process.env.PORT : '2023';
export const JWT_SECRET_TOKEN = process.env.hasOwnProperty('JWT_SECRET_TOKEN') ? process.env.JWT_SECRET_TOKEN : '32c103437dbee3dae37dcbe8cd459226fc47bbd9942e335c088a9ecbf908fe8fa7f828e4c8c354e1bf07f3ac2c084610b3e83d18a91b65e390ee83231312eefb';
export const JWT_EXPIRES_IN = process.env.hasOwnProperty('JWT_EXPIRES_IN') ? process.env.JWT_EXPIRES_IN : '24h';


/*************************** 
    DATABASE CONFIGRATIONS
***************************/

export const DB_HOST = process.env.hasOwnProperty('DB_HOST') ? process.env.DB_HOST : '127.0.0.1';
export const DB_PORT = process.env.hasOwnProperty('DB_PORT') ? process.env.DB_PORT : '27017';
export const DB_NAME = process.env.hasOwnProperty('DB_NAME') ? process.env.DB_NAME : 'skin_care';


/***************************
        AWS CREDENTIALS
***************************/

const AWS_S3_ACCESS_KEY = process.env.hasOwnProperty('AWS_S3_ACCESS_KEY') ? process.env.AWS_S3_ACCESS_KEY : 'AKIAZZGJRL7GMGPB7PJV';
const AWS_S3_SECRET_ACCESS_KEY = process.env.hasOwnProperty('AWS_S3_SECRET_ACCESS_KEY') ? process.env.AWS_S3_SECRET_ACCESS_KEY : 'Dtui7n7FKMelE4BS8F5xL5p4ZxliGXnowjLMFuzu';
const AWS_S3_BUCKET_REGION = process.env.hasOwnProperty('AWS_S3_BUCKET_REGION') ? process.env.AWS_S3_BUCKET_REGION : 'ap-southeast-1';
export const AWS_S3_BUCKET = process.env.hasOwnProperty('AWS_S3_BUCKET') ? process.env.AWS_S3_BUCKET : 'skinocare';
export const EXPIRES_SINGNED_URL = process.env.hasOwnProperty('EXPIRES_SINGNED_URL') ? process.env.EXPIRES_SINGNED_URL : 300 // = 60 * 5min;

const awsConfig = { accessKeyId: AWS_S3_ACCESS_KEY, secretAccessKey: AWS_S3_SECRET_ACCESS_KEY, region: AWS_S3_BUCKET_REGION }
export const S3 = new AWS.S3(awsConfig);



/***************************
    MAILER CONFIGRATIONS
***************************/

const EMAIL_HOST = process.env.hasOwnProperty('EMAIL_HOST') ? process.env.EMAIL_HOST : 'smtp.gmail.com';
export const EMAIL_FROM = process.env.hasOwnProperty('EMAIL_FROM') ? process.env.EMAIL_FROM : 'skinocares1@gmail.com';
const EMAIL_PASSWORD = process.env.hasOwnProperty('EMAIL_PASSWORD') ? process.env.EMAIL_PASSWORD : 'mrbigwkcczzmkbkr';
export const mailer = nodemailer.createTransport({ host: EMAIL_HOST, port: 465, secure: true, auth: { user: EMAIL_FROM, pass: EMAIL_PASSWORD, }, });


/***************************
    MULTER CONFIGRATIONS
***************************/

export const multerImageUpload = multer({ limits: { fileSize: 1024 * 1024 * 5, }, fileFilter: function (req, file, done) { if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/webp" || file.mimetype === "image/svg+xml" || file.mimetype === "application/pdf") { done(null, true); } else { var newError = new Error("File type is incorrect"); newError.name = "MulterError"; done(newError, false); } }, });


export const multerVideoUpload = multer({ limits: { fileSize: 1024 * 1024 * 20, }, fileFilter: function (req, file, done) { if (file.mimetype === "video/mp4") { done(null, true); } else { var newError = new Error("File type is incorrect"); newError.name = "MulterError"; done(newError, false); } }, });

/***************************
    AWS SAVING FILE PATH
***************************/


export const uploadsPath = (type) => {
    var array = { Category: "uploads/categories", Product: "uploads/products", Testimonial: "uploads/testimonials", CaseStudy: "uploads/case_studies", Logo: "uploads/logos", Doctor: "uploads/doctor", SkinOCareJourney: "uploads/skinocare-journey", Explore: "uploads/explore", SkinAndHair: "uploads/skin-and-hair", ImageAnalysis: "uploads/image_analysis", Chat: "uploads/chat", Plan: "uploads/plan", Notification: "uploads/notification" };
    return `${array[type]}`;

}


/***************************
    RAZORPAY CONFIGRATIONS
***************************/

export const RAZORPAY_KEY_ID = !process.env.hasOwnProperty('RAZORPAY_KEY_ID') ? "rzp_test_YJWihDNp5IscjX" : process.env.RAZORPAY_KEY_ID;

export const RAZORPAY_KEY_SECRET = !process.env.hasOwnProperty('RAZORPAY_KEY_SECRET') ? "CG6yDlSdpQXHK71t4mfKcP5D" : process.env.RAZORPAY_KEY_SECRET;


/***************************
  SHIPROCKET CONFIGRATIONS
***************************/

export const SHIPROCKET_EMAIL = !process.env.hasOwnProperty('SHIPROCKET_EMAIL') ? "sanjaymgowda8888@gmail.com" : process.env.SHIPROCKET_EMAIL;

export const SHIPROCKET_PASSWORD = !process.env.hasOwnProperty('SHIPROCKET_PASSWORD') ? "sanjaym@123" : process.env.SHIPROCKET_PASSWORD;

export const SHIPROCKET_TRACKING_LINK = !process.env.hasOwnProperty('SHIPROCKET_TRACKING_LINK') ? "https://shiprocket.co/tracking/order" : process.env.SHIPROCKET_TRACKING_LINK;

export const SHIPROCKET_COMPANY_ID = !process.env.hasOwnProperty('SHIPROCKET_COMPANY_ID') ? "4019279" : process.env.SHIPROCKET_COMPANY_ID;

/***************************
  CHECK DATABASE SETTINGS
***************************/

export const SETTINGS = ["shipping_method", "payment_method", "general_settings"]


/***************************
  PHONEPE CONFIGRATIONS
***************************/

export const PHONEPE_MERCHANT_ID = !process.env.hasOwnProperty('PHONEPE_MERCHANT_ID') ? "M18OBUYZ4M2Z" : process.env.PHONEPE_MERCHANT_ID;
export const PHONEPE_SALT_KEY = !process.env.hasOwnProperty('PHONEPE_SALT_KEY') ? "a9ddb91d-934b-450c-9926-2719c45f1e0e" : process.env.PHONEPE_SALT_KEY;
export const PHONEPE_REDIRECT_URL = !process.env.hasOwnProperty('PHONEPE_REDIRECT_URL') ? "http://127.0.0.1:5000/api/user/phonepe/redirect-url/" : process.env.PHONEPE_REDIRECT_URL;
export const PHONEPE_CALLBACK_URL = !process.env.hasOwnProperty('PHONEPE_CALLBACK_URL') ? "https://127.0.0.1:5000/api/user/phonepe/callback-url" : process.env.PHONEPE_CALLBACK_URL;


/*************************************
    IMAGE ANALYSIS API CONFIGRATIONS
*************************************/

export const IMAGE_ANALYSIS_API_KEY = process.env.hasOwnProperty('IMAGE_ANALYSIS_API_KEY') ? process.env.IMAGE_ANALYSIS_API_KEY : '391a2cc4fcmsh8076a614f4ad2d2p1abdb2jsn92e5370f5f98';


/*******************************************
    IMAGE ANALYSIS AILABS API CONFIGRATIONS
*******************************************/

export const IMAGE_ANALYSIS_API_KEY_AILABS = process.env.hasOwnProperty('IMAGE_ANALYSIS_API_KEY_AILABS') ? process.env.IMAGE_ANALYSIS_API_KEY_AILABS : 'MCAjAtO69xcrujnJri8fctFmK8D4RQoHKsahOWXBn6FyVBq2dg5wv5LRyWzqg9Gl';

/************************************
    FIREBASE SERVER KEY CONFIGRATIONS
************************************/

export const FIREBASE_SERVER_KEY = process.env.hasOwnProperty('FIREBASE_SERVER_KEY') ? process.env.FIREBASE_SERVER_KEY : 'AAAAe5OQyC4:APA91bFKPIv1xQyP0Plc_soa8lM7ysv0CcsoCLgCtqMADp6Qa89a8n-6o7Op8jltIPToXBsb0tDlPscAb3C1IzLYrpZhOYpJnmng-SSQh9nPhFXMMxKvvqIFN6irOsm0ndNtmI4wdYF_';

/***********************
    MSG91 CONFIGRATIONS
***********************/
export const MSG91_TEMPLATE_ID = process.env.hasOwnProperty('MSG91_TEMPLATE_ID') ? process.env.MSG91_TEMPLATE_ID : '65a7c6a1d6fc050f96268e1a';
export const MSG91_AUTH_KEY = process.env.hasOwnProperty('MSG91_AUTH_KEY') ? process.env.MSG91_AUTH_KEY : '413322A0Kgyebqr265a7c2ecP1'; 