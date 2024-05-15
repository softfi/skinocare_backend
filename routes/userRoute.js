import express from "express";
import morgan from "morgan";
import { body, validationResult } from "express-validator";
export const userRoute = express.Router();
export const userAuthRoute = express.Router();

/***************************
        CUSTOM IMPORTS
****************************/
import User from "../models/User.js";
import {
  userRegister,
  userLogin,
  resendOtp,
  verifyOtp,
  applogin,
  appverifyOtp,
  appuserRegister,
  appresendOtp,
  logout,
  userAuthDetails,
  updateUserDetails,
} from "../controllers/user/authController.js";
import {
  uploadImageValdator,
  userValidation,
} from "../validation/userValidation.js";
import { userMenusList } from "../controllers/user/menuController.js";
import {
  addShippingAddress,
  defaultShippingAddress,
  deleteShippingAddress,
  getshippingAddressById,
  shippingAddressList,
  updateShippingAddress,
} from "../controllers/user/shippingAddressController.js";
import {
  updateCart,
  addToCart,
  getCartList,
  removeFromCart,
} from "../controllers/user/cartController.js";
import { addKitOrder, addOrder, orderList } from "../controllers/user/orderController.js";
import {
  clearRecentSearch,
  recentProducts,
  recentSearch,
  recentSearchStore,
} from "../controllers/user/recentController.js";
import { addReview } from "../controllers/user/reviewController.js";
import {
  addWishlist,
  removeWishlist,
  wishlist,
} from "../controllers/user/wishlistController.js";
import ShippingAddress from "../models/ShippingAddress.js";
import { authValues } from "../helpers/helper.js";
import { KitBilling, billing, getInstructionByKitId, kitCheckout } from "../controllers/user/checkoutController.js";
import Cart from "../models/Cart.js";
import {
  failedPayment,
  payment,
  paymentVerify,
} from "../controllers/user/paymentController.js";
import Order from "../models/Order.js";
import { applyCoupon, getPlanByKitId } from "../controllers/webController.js";
import Setting from "../models/Setting.js";
import {
  callback_url,
  createPayment,
  checkStatus,
} from "../controllers/user/phonepeController.js";
import {
  addOrUpdateLike,
  getExplore,
} from "../controllers/user/exploreController.js";
import {
  addOrUpdateUserFeedback,
  getUserFeedback,
} from "../controllers/user/feedbackController.js";
import { getUserReferralCode, verifyReferralCode } from "../controllers/user/referralController.js";
import { multerImageUpload } from "../config/config.js";
import {
  analysisReport,
  analysisReportDelete,
  faceAnalysisStatus,
  generateKit,
  imageProcessNew,
  imageProcessWithLiveData,
  otpToCallStatus,
  skinAnalysisRapidApi,
  updateDeviceId,
  userDetails,
} from "../controllers/user/userProfileController.js";
import SkinAnalysisNew from "../models/SkinAnalysisNew.js";
import { getWalletHistoryByCustomerId, walletHistoryList } from "../controllers/user/walletHistoryController.js";
import { addFaqsDisLike, addFaqsLike } from "../controllers/user/faqController.js";
import { checkPaymentStatus, dietConsultationPayment, userDietConsultation } from "../controllers/user/dietConsultationController.js";
import { dietConsultationList } from "../controllers/admin/DietConsultationController.js";
import { uploadImage } from "../controllers/admin/uploadController.js";
import kit from "../models/kit.js";
import { appNotification, deleteNotification, readUnreadNotification } from "../controllers/user/notificationController.js";
import SkinAnalysis from "../models/SkinAnalysis.js";
import { previousChat, sendChatNotification } from "../controllers/user/chatHistoryController.js";

/* Middleware For Creating Console Log of Routes*/
userAuthRoute.use(morgan("dev"));
userRoute.use(morgan("dev"));

/****************************
  REGISTER & LOGIN ROUTES
****************************/
userRoute.post(
  "/register",
  [
    body("name", "Name field is Required")
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Name should have Minimum 3 Characters"),
    body("email")
      .optional()
      .isEmail()
      .custom(async (email) => {
        const user = await User.findOne({ email: email });
        if (user) {
          throw new Error("Email already in Exist");
        } else {
          return true;
        }
      }),
    body("mobile")
      .optional()
      .isNumeric()
      .withMessage("Mobile should Numaric Characters")
      .isLength({ min: 10, max: 10 })
      .withMessage("Mobile No should have 10 Number")
      .custom(async (mobile) => {
        const user = await User.findOne({ mobile: mobile });
        if (user) {
          throw new Error("Mobile already in Exist");
        } else {
          return true;
        }
      }),
    body("password")
      .notEmpty()
      .withMessage("Password field is Required")
      .isLength({ min: 6, max: 16 })
      .withMessage("Password must be between 6 to 16 characters"),
    body("confirm_password").custom(async (confirm_password, { req }) => {
      const password = req.body.password.trim();
      if (password !== confirm_password.trim()) {
        throw new Error("Passwords must be same");
      }
    }),
  ],
  userValidation,
  userRegister
);

userRoute.post(
  "/login",
  [
    body("email", "Email field is Required/Invaild Email").notEmpty().isEmail(),
    body("password", "Password field is Required").notEmpty(),
  ],
  userValidation,
  userLogin
);

userRoute.post(
  "/applogin",
  [
    body("type", "Type field is Required/Invaild Email")
      .notEmpty()
      .custom((item) => {
        if (item != "email" && item != "mobile") {
          throw Error("Type Only have selected Value Mobile Or Email!!");
        }
        return true;
      }),
    body("value", "Email or Mobile field is Required")
      .notEmpty()
      .custom((item, { req }) => {
        if (req?.body?.type == "email") {
          let regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
          if (regex.test(req?.body?.value) == false) {
            throw Error("Valid Email is required!!");
          }
        } else if (req?.body?.type == "mobile") {
          if (
            (req?.body?.value?.length < 10 && req?.body?.value?.length > 10) ||
            Number(req?.body?.value) == NaN
          ) {
            throw Error("Please Enter Valid Mobile No!!");
          }
        }
        return true;
      }),
  ],
  userValidation,
  applogin
);

userRoute.post(
  "/app-verify-otp",
  [
    body("type", "Type field is Required/Invaild Email")
      .notEmpty()
      .custom((item) => {
        if (item != "email" && item != "mobile") {
          throw Error("Type Only have selected Value Mobile Or Email!!");
        }
        return true;
      }),
    body("value", "Email or Mobile field is Required")
      .notEmpty()
      .custom((item, { req }) => {
        if (req?.body?.type == "email") {
          let regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
          if (regex.test(req?.body?.value) == false) {
            throw Error("Valid Email is required!!");
          }
        } else if (req?.body?.type == "mobile") {
          if (
            (req?.body?.value?.length < 10 && req?.body?.value?.length > 10) ||
            Number(req?.body?.value) == NaN
          ) {
            throw Error("Please Enter Valid Mobile No!!");
          }
        }
        return true;
      }),
    body("otp", "Otp field is Required").notEmpty(),
  ],
  userValidation,
  appverifyOtp
);

userRoute.post(
  "/app-register",
  [
    body("type", "Type field is Required/Invaild Email")
      .notEmpty()
      .custom((item) => {
        if (item != "email" && item != "mobile") {
          throw Error("Type Only have selected Value Mobile Or Email!!");
        }
        return true;
      }),
    body("value", "Email or Mobile field is Required")
      .notEmpty()
      .custom(async (item, { req }) => {
        if (req?.body?.type == "email") {
          let regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
          if (regex.test(req?.body?.value) == false) {
            throw Error("Valid Email is required!!");
          }
          if (await User.findOne({ email: item, name: { $ne: null } })) {
            throw new Error("Email already in Exist");
          }
        } else if (req?.body?.type == "mobile") {
          if (
            (req?.body?.value?.length < 10 && req?.body?.value?.length > 10) ||
            Number(req?.body?.value) == NaN
          ) {
            throw Error("Please Enter Valid Mobile No!!");
          }
        }
        return true;
      }),
    body("email")
      .optional()
      .isEmail()
      .custom(async (email, { req }) => {
        if (
          req?.body?.type == "mobile" ||
          (req?.body?.type == "email" && req?.body?.value != email)
        ) {
          const user = await User.findOne({ email: email });
          if (user) {
            throw new Error("Email already in Exist");
          } else {
            return true;
          }
        } else {
          return true;
        }
      }),
    body("name", "Name  field is Required").notEmpty(),
    body("age", "Age field is Required").notEmpty(),
    body("gender", "Gender field is Required").notEmpty(),
  ],
  userValidation,
  appuserRegister
);

userRoute.post(
  "/app-resend-otp",
  [
    body("type", "Type field is Required/Invaild Email")
      .notEmpty()
      .custom((item) => {
        if (item != "email" && item != "mobile") {
          throw Error("Type Only have selected Value Mobile Or Email!!");
        }
        return true;
      }),
    body("value", "Email or Mobile field is Required")
      .notEmpty()
      .custom((item, { req }) => {
        if (req?.body?.type == "email") {
          let regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
          if (regex.test(req?.body?.value) == false) {
            throw Error("Valid Email is required!!");
          }
        } else if (req?.body?.type == "mobile") {
          if (
            (req?.body?.value?.length < 10 && req?.body?.value?.length > 10) ||
            Number(req?.body?.value) == NaN
          ) {
            throw Error("Please Enter Valid Mobile No!!");
          }
        }
        return true;
      }),
  ],
  userValidation,
  appresendOtp
);

/****************************
  USER AUTHENTICATED ROUTES 
****************************/

/* OTP ROUTES START */
userAuthRoute.post(
  "/resend-otp",
  [
    body("sendOn")
      .notEmpty()
      .withMessage("Send On field is required")
      .custom(async (value) => {
        if (value === "email" || value === "mobile") {
          return true;
        } else {
          throw new Error("sendOn Contain Only Selected Values");
        }
      }),
  ],
  userValidation,
  resendOtp
);

userAuthRoute.post(
  "/verify-otp",
  [
    body("otp", "OTP field is required")
      .notEmpty()
      .isNumeric()
      .withMessage("OTP should be a number")
      .isLength({ min: 6, max: 6 })
      .withMessage("6 Character are allowed In this Field"),
    body("sendOn")
      .notEmpty()
      .withMessage("Send On field is required")
      .custom(async (value) => {
        if (value === "email" || value === "mobile") {
          return true;
        } else {
          throw new Error("sendOn Contain Only Selected Values");
        }
      }),
  ],
  userValidation,
  verifyOtp
);

/* OTP ROUTES END */

/* MENU ROUTES START */

userAuthRoute.get("/menus-list", userMenusList);

/* MENU ROUTES END */

/* SHIPPING ADDRESS ROUTES START */

userAuthRoute.get("/shipping-address", shippingAddressList);

userAuthRoute.post(
  "/shipping-address",
  [
    body("name").notEmpty().withMessage("Name field is Required"),
    body("phone")
      .notEmpty()
      .isLength({ min: 10, max: 10 })
      .withMessage("Phone field is Required or Length 10"),
    // body("alternativePhone").notEmpty().withMessage("Alternative Phone field is Required"),
    body("pincode")
      .notEmpty()
      .withMessage("Pincode field is Required")
      .isNumeric()
      .isLength({ min: 6, max: 6 })
      .withMessage("Numeric value is allowed in Pincode Or Min Length 6"),
    body("district").notEmpty().withMessage("District field is Required"),
    body("state").notEmpty().withMessage("State field is Required"),
    body("country").optional(),
    body("area").notEmpty().withMessage("Area field is Required"),
    body("locatity").notEmpty().withMessage("Locatity field is Required"),
    body("landmark").notEmpty().withMessage("Landmark field is Required"),
    body("houseNo").notEmpty().withMessage("HouseNo field is Required"),
    body("isDefault")
      .notEmpty()
      .withMessage("Is Default field is Required")
      .isBoolean("Is Default should be Boolean"),
  ],
  userValidation,
  addShippingAddress
);

userAuthRoute.get(
  "/shipping-address/:shippingAddressId",
  getshippingAddressById
);

userAuthRoute.put(
  "/shipping-address",
  [
    body("shippingAddressId")
      .notEmpty()
      .withMessage("Shipping Address Id field is Required"),
    body("name").notEmpty().withMessage("Name field is Required"),
    body("phone")
      .notEmpty()
      .isLength({ min: 10, max: 10 })
      .withMessage("Phone field is Required or Length 10"),
    // body("alternativePhone").notEmpty().withMessage("Alternative Phone field is Required"),
    body("pincode")
      .notEmpty()
      .withMessage("Pincode field is Required")
      .isNumeric()
      .isLength({ min: 6, max: 6 })
      .withMessage("Numeric value is allowed in Pincode Or Min Length 6"),
    body("district").notEmpty().withMessage("District field is Required"),
    body("state").notEmpty().withMessage("State field is Required"),
    body("country").optional(),
    body("area").notEmpty().withMessage("Area field is Required"),
    body("locatity").notEmpty().withMessage("Locatity field is Required"),
    body("landmark").notEmpty().withMessage("Landmark field is Required"),
    body("houseNo").notEmpty().withMessage("HouseNo field is Required"),
    body("isDefault")
      .notEmpty()
      .withMessage("Is Default field is Required")
      .isBoolean("Is Default should be Boolean"),
  ],
  userValidation,
  updateShippingAddress
);

userAuthRoute.delete("/shipping-address", deleteShippingAddress);

userAuthRoute.post("/shipping-address/delete", deleteShippingAddress);

userAuthRoute.get("/default-shipping-address", defaultShippingAddress);
/* SHIPPING ADDRESS ROUTES END */

/* CART ROUTES START */

userAuthRoute.get("/cart", getCartList);

userAuthRoute.post(
  "/cart",
  [
    body("productId").notEmpty().withMessage("Product Id field is Required"),
    body("quantity").notEmpty().withMessage("Quantity field is Required"),
  ],
  userValidation,
  addToCart
);

userAuthRoute.put(
  "/cart",
  [
    body("cartId").notEmpty().withMessage("Cart Id field is Required"),
    body("quantity").notEmpty().withMessage("Quantity field is Required"),
  ],
  userValidation,
  updateCart
);

userAuthRoute.post(
  "/cart/delete",
  [body("cartId").notEmpty().withMessage("Cart Id field is Required")],
  userValidation,
  removeFromCart
);

/* CART ROUTES END */

/* ORDER ROUTES START */

userAuthRoute.get("/order", orderList);

userAuthRoute.post(
  "/order",
  [
    body("checkoutType")
      .notEmpty()
      .withMessage("Checkout Type field is Required")
      .custom(async (type, { req }) => {
        if (type == "cart" || type == "buy") {
          let customer = await authValues(req.headers["authorization"]);
          if (
            type == "cart" &&
            (await Cart.find({ customerId: customer._id }).count()) < 1
          ) {
            throw new Error("Cart is Empty");
          } else {
            return true;
          }
        }
        throw new Error("Checkout Type Must be cart or buy");
      }),
    body("couponCode").optional(),
    body("shippingAddressId")
      .notEmpty()
      .withMessage("Shipping Address Field is Required")
      .custom(async (value, { req }) => {
        let customer = await authValues(req.headers["authorization"]);
        if (
          !(await ShippingAddress.findOne({
            _id: value,
            customerId: customer?._id,
            isDeleted: false,
          }))
        ) {
          throw new Error("Shipping Address Id Not Found");
        }
        return true;
      }),
    body("productId").custom(async (productId, { req }) => {
      if (
        req.body.checkoutType == "buy" &&
        !req.body.hasOwnProperty("productId")
      ) {
        throw new Error("Product Id field is Required");
        return false;
      }
      return true;
    }),
    body("quantity").custom(async (productId, { req }) => {
      if (
        req.body.checkoutType == "buy" &&
        !req.body.hasOwnProperty("quantity")
      ) {
        throw new Error("Quantity field is Required");
      }
      return true;
    }),
    body("paymentMethod").custom(async (paymentMethod) => {
      let paymentMethods = await Setting.findOne({ type: "payment_method" });
      if (paymentMethods) {
        if (paymentMethods?.value[0].hasOwnProperty(paymentMethod)) {
          return true;
        } else {
          throw new Error("Please Provide the Registered Payment Method");
        }
      } else {
        throw new Error("Payment Method Not Found!");
      }
    }),
    body("shippingMethod")
      .notEmpty()
      .withMessage("Shipping Method field is Required")
      .custom(async (method, { req }) => {
        let shippingMethods = await Setting.findOne({
          type: "shipping_method",
        });
        if (!shippingMethods.value[0].hasOwnProperty(method)) {
          throw new Error("Please Provide the Registered Shipping Method");
        }
        return true;
      }),
  ],
  userValidation,
  addOrder
);

/* ORDER ROUTES END */

/* RECENT PRODUCT/SEARCH ROUTES START */

userAuthRoute.get("/recent-products", recentProducts);

userAuthRoute.get("/product/recent/search", recentSearch);

userAuthRoute.post(
  "/product/recent/store",
  [body("slug").notEmpty().withMessage("Slug field is Required")],
  userValidation,
  recentSearchStore
);

userAuthRoute.delete("/product/recent/search", clearRecentSearch);

/* RECENT PRODUCT/SEARCH ROUTES END */

// PRODUCT REVIEWS ROUTES START

userAuthRoute.post(
  "/add-review",
  [
    body("productId").notEmpty().withMessage("Product Id field is Required"),
    body("comment").notEmpty().withMessage("Comment field is Required"),
    body("rating")
      .notEmpty()
      .withMessage("Rating field is Required")
      .isNumeric()
      .withMessage("Numeric value is allowed in rating")
      .custom(async (value) => {
        if (value > 0 && value <= 5) {
          return true;
        } else {
          throw new Error("You can rate betwen 1 to 5 Only!!");
        }
      }),
  ],
  userValidation,
  addReview
);

// PRODUCT REVIEWS ROUTES END

//WISHLIST ROUTES START

userAuthRoute.get("/wishlist", wishlist);

userAuthRoute.post("/wishlist/:productId", addWishlist);

userAuthRoute.delete("/wishlist/:productId", removeWishlist);

//WISHLIST ROUTES END

/* BILLING ROUTE START */

userAuthRoute.post(
  "/billing",
  [
    body("checkoutType")
      .notEmpty()
      .withMessage("Checkout Type field is Required")
      .custom(async (type, { req }) => {
        if (type == "cart" || type == "buy" || type == "kit") {
          let customer = await authValues(req.headers["authorization"]);
          if (
            type == "cart" &&
            (await Cart.find({ customerId: customer._id }).count()) < 1
          ) {
            throw new Error("Cart is Empty");
          } else {
            return true;
          }
        }
        throw new Error("Checkout Type Must be cart, buy or kit");
      }),
    body("productId").custom(async (productId, { req }) => {
      if (
        req.body.checkoutType == "buy" &&
        !req.body.hasOwnProperty("productId")
      ) {
        throw new Error("Product Id field is Required");
      }
      return true;
    }),
    body("quantity").custom(async (value, { req }) => {
      if (
        req.body.checkoutType == "buy" &&
        !req.body.hasOwnProperty("quantity")
      ) {
        throw new Error("Quantity field is Required");
      }
      return true;
    }),
    body("shippingMethod")
      .notEmpty()
      .withMessage("Shipping Method field is Required")
      .custom(async (method, { req }) => {
        let shippingMethods = await Setting.findOne({
          type: "shipping_method",
        });
        if (!shippingMethods.value[0].hasOwnProperty(method)) {
          throw new Error("Please Provide the Registered Shipping Method");
        }
        return true;
      }),
  ],
  userValidation,
  billing
);

/* BILLING ROUTE END */

/* PAYMENT ROUTE START */

userAuthRoute.post(
  "/payment",
  [body("orderId").notEmpty().withMessage("Order Id field is Required")],
  userValidation,
  payment
);

userRoute.post(
  "/payment-verify",
  [
    body("razorpay_order_id")
      .notEmpty()
      .withMessage("Razorpay Order Id field is required"),
    body("razorpay_payment_id")
      .notEmpty()
      .withMessage("Razorpay Order Id field is required"),
    body("razorpay_signature")
      .notEmpty()
      .withMessage("Razorpay Signature field is required"),
  ],
  userValidation,
  paymentVerify
);

userAuthRoute.post(
  "/payment/failed",
  [
    body("orderId")
      .notEmpty()
      .withMessage("Order Id Field is Required")
      .custom(async (orderId, { req }) => {
        let customer = await authValues(req.headers["authorization"]);
        if (
          !(await Order.findOne({ customerId: customer?._id, _id: orderId }))
        ) {
          throw new Error("Order Id is Invalid!!");
          return false;
        }
        return true;
      }),
  ],
  userValidation,
  failedPayment
);

/* PAYMENT ROUTE END */

/* APPLY COUPON ROUTE START */

userAuthRoute.post(
  "/apply-coupon",
  [
    body("totalAmount")
      .notEmpty()
      .withMessage("Total Amount field is Required"),
    body("couponCode")
      .isLength({ min: 1 })
      .trim()
      .withMessage("couponCode field is Required")
      .notEmpty()
      .withMessage("couponCode field is Required"),
  ],
  userValidation,
  applyCoupon
);

/* APPLY COUPON ROUTE END */

/* USER PROFILE ROUTE START */

userAuthRoute.get("/user-details", userAuthDetails);

userAuthRoute.put(
  "/user-details",
  [
    body("image").optional(),
    body("age").notEmpty().withMessage("Age field is Required"),
    body("name").notEmpty().withMessage("Name field is Required"),
    body("email").notEmpty().withMessage("Email field is Required"),
    body("mobile").notEmpty().withMessage("Mobile field is Required"),
  ],
  userValidation,
  updateUserDetails
);

/* USER PROFILE ROUTE END */

/* PHONE PE ROUTE START */

userAuthRoute.post(
  "/phonepe/create-payment",
  [body("orderId").notEmpty().withMessage("Order Id field is required")],
  userValidation,
  createPayment
);
userRoute.post(
  "/phonepe/payment-status",
  [
    body("transactionId")
      .notEmpty()
      .withMessage("transaction Id field is required"),
  ],
  userValidation,
  checkStatus
);
// userRoute.post('/phonepe/redirect-url/:merchantTransactionId', redirect_url);

/* PHONE PE ROUTE END */

/* Explore ROUTE START */

userAuthRoute.get("/explore", getExplore);

userAuthRoute.get("/explore/like-or-unlike/:exploreId", addOrUpdateLike);

/* Explore ROUTE END */

/* FEEDBACK ROUTE START */

userAuthRoute.get("/feedback", getUserFeedback);

userAuthRoute.post(
  "/feedback",
  [
    body("rating")
      .notEmpty()
      .withMessage("rating field is required")
      .isFloat({ min: 1, max: 5 })
      .withMessage("rating must be number between 1 to 5"),
    body("reviews")
      .notEmpty()
      .withMessage("reviews field is required")
      .isArray()
      .withMessage("reviews must be array of question and answer"),
  ],
  userValidation,
  addOrUpdateUserFeedback
);

/* FEEDBACK ROUTE END */

/* REFERRAL CODE ROUTE START */

userAuthRoute.get("/referral-code", getUserReferralCode);

userRoute.post("/referral-code-verify", [
  body("referralCode")
    .notEmpty()
    .withMessage("Referral Code field is required")
],
  verifyReferralCode);


/* REFERRAL CODE ROUTE END */

/* WALLET HISTORY ROUTE START */

userAuthRoute.get("/wallet-history", getWalletHistoryByCustomerId);


/* WALLET HISTORY ROUTE END */

/* IMAGE ANALYSIS API START */

userAuthRoute.post(
  "/image-process-with-live-data",
  multerImageUpload.single("image"),
  uploadImageValdator,
  imageProcessWithLiveData
);

userAuthRoute.post(
  "/skin-analysis-rapid-api",
  multerImageUpload.single("image"),
  uploadImageValdator,
  skinAnalysisRapidApi
);

userAuthRoute.post(
  "/image-process-new-api",
  multerImageUpload.single("image"),
  uploadImageValdator,
  imageProcessNew
);

userAuthRoute.post("/analysis-report", analysisReport);
userAuthRoute.post(
  "/analysis-report-delete",
  [
    body("analysisId")
      .notEmpty()
      .withMessage("Analysis Id Field is Required")
      .custom(async (analysisId, { req }) => {
        let customer = await authValues(req.headers["authorization"]);
        if (
          !(await SkinAnalysis.findOne({
            customerId: customer?._id,
            _id: analysisId,
          }))
        ) {
          throw new Error("Analysis Id is Invalid!!");
          return false;
        }
        return true;
      }),
  ],
  userValidation,
  analysisReportDelete
);

/* IMAGE ANALYSIS API END */

/* FAQ LIKE UNLIKE API START */
userAuthRoute.get('/faq/like/:faqId', addFaqsLike);
userAuthRoute.get('/faq/dislike/:faqId', addFaqsDisLike);
/* FAQ LIKE UNLIKE API END */



userAuthRoute.get('/diet', userDietConsultation);
userAuthRoute.post(
  "/diet/create-payment",
  [body("dietId").notEmpty().withMessage("Diet Id field is required"),
  body("mobile").notEmpty().withMessage("Mobile field is required")],
  userValidation,
  dietConsultationPayment
);

userRoute.post(
  "/diet/payment-status",
  [
    body("transactionId")
      .notEmpty()
      .withMessage("transaction Id field is required"),
  ],
  userValidation,
  checkPaymentStatus
);


userAuthRoute.post(
  "/upload-image",
  multerImageUpload.single("image"),
  uploadImageValdator,
  uploadImage
);

userAuthRoute.post(
  "/generate-kit",
  [
    body("type")
      .notEmpty()
      .withMessage("type Field is Required")
      .custom(async (type, { req }) => {
        if (
          type == 'hair' || type == 'skin'
        ) {
          return true;
        }
        throw new Error("type must be hair or skin!!");
        return false;
      }),
  ],
  userValidation,
  generateKit
);


userAuthRoute.post(
  "/kit/checkout",
  [
    body("type")
      .notEmpty()
      .withMessage("Type field is Required")
      .custom((value) => {
        if (
          value === "skin" ||
          value === "hair"
        ) {
          return true;
        }
        throw new Error("type must be hair or skin");
      })
  ],
  userValidation,
  kitCheckout
);

userAuthRoute.post(
  "/get-instruction-by-kitId",
  [
    body("type")
      .notEmpty()
      .withMessage("Type field is Required")
      .custom((value) => {
        if (
          value === "skin" ||
          value === "hair"
        ) {
          return true;
        }
        throw new Error("type must be hair or skin");
      })
  ],
  userValidation,
  getInstructionByKitId
);

userAuthRoute.post(
  "/get-plan-by-kitId",
  [
    body("kitId")
      .notEmpty()
      .withMessage("kitId Field is Required")
      .custom(async (kitId, { req }) => {
        let KitData = await kit.findById(kitId);
        if (KitData) {
          return true;
        }
        throw new Error("kitId is invalid!!");
        return false;
      }),
  ],
  userValidation,
  getPlanByKitId
);


userAuthRoute.post(
  "/kit",
  [
    body("shippingAddressId")
      .notEmpty()
      .withMessage("Shipping Address Field is Required")
      .custom(async (value, { req }) => {
        let customer = await authValues(req.headers["authorization"]);
        if (
          !(await ShippingAddress.findOne({
            _id: value,
            customerId: customer?._id,
            isDeleted: false,
          }))
        ) {
          throw new Error("Shipping Address Id Not Found");
        }
        return true;
      }),
    body("paymentMethod").custom(async (paymentMethod) => {
      let paymentMethods = await Setting.findOne({ type: "payment_method" });
      if (paymentMethods) {
        if (paymentMethods?.value[0].hasOwnProperty(paymentMethod)) {
          return true;
        } else {
          throw new Error("Please Provide the Registered Payment Method");
        }
      } else {
        throw new Error("Payment Method Not Found!");
      }
    }),
    body("shippingMethod")
      .notEmpty()
      .withMessage("Shipping Method field is Required")
      .custom(async (method, { req }) => {
        let shippingMethods = await Setting.findOne({
          type: "shipping_method",
        });
        if (!shippingMethods.value[0].hasOwnProperty(method)) {
          throw new Error("Please Provide the Registered Shipping Method");
        }
        return true;
      }),
    body("useWalletPoint")
      .notEmpty()
      .withMessage("useWalletPoint Field is Required")
  ],
  userValidation,
  addKitOrder
);


userAuthRoute.post(
  "/kit/billing",
  [
    body("kitType")
      .notEmpty()
      .withMessage("Kit  Type field is Required"),
    body("shippingMethod")
      .notEmpty()
      .withMessage("Shipping Method field is Required")
      .custom(async (method, { req }) => {
        let shippingMethods = await Setting.findOne({
          type: "shipping_method",
        });
        if (!shippingMethods.value[0].hasOwnProperty(method)) {
          throw new Error("Please Provide the Registered Shipping Method");
        }
        return true;
      }),
  ],
  userValidation,
  KitBilling
);



userAuthRoute.post(
  "/update-device-id",
  [
    body("deviceId")
    .notEmpty()
    .withMessage("deviceId Field is Required"),
  ],
  userValidation,
  updateDeviceId
);


userAuthRoute.get(
  "/app-notification",
  appNotification
);


userAuthRoute.post(
  "/read-unread-notification",
  [
    body("type")
    .notEmpty()
    .withMessage("type Field is Required")
    .custom((value) => {
      if (
        value === "read" ||
        value === "unread"
      ) {
        return true;
      }
      throw new Error("type must be read or unread");
    }),
    body("notificationId")
    .notEmpty()
    .withMessage("Notification Id Field is Required"),
  ],
  userValidation,
  readUnreadNotification
);


userAuthRoute.post(
  "/delete-notification",
  deleteNotification
);

userAuthRoute.post(
  "/previous-chat",
  previousChat
);

userAuthRoute.post(
  "/send-chat-notification",
  [
    body("type")
    .notEmpty()
    .withMessage("type Field is Required")
    .custom((value) => {
      if (
        value == "hair" ||
        value == "skin"
      ) {
        return true;
      }
      throw new Error("type must be hair or skin");
    })
  ],
  userValidation,
  sendChatNotification
);

userAuthRoute.post(
  "/opt-to-call-status",
  [
    body("type")
    .notEmpty()
    .withMessage("type Field is Required")
    .custom((value) => {
      if (
        value == "get" ||
        value == "set"
      ) {
        return true;
      }
      throw new Error("type must be get or set");
    }),
    body("concernType")
    .notEmpty()
    .withMessage("concern Type Field is Required")
    .custom((value) => {
      if (
        value == "hair" ||
        value == "skin"
      ) {
        return true;
      }
      throw new Error("concern Type must be hair or skin");
    })
  ],
  userValidation,
  otpToCallStatus
);

userAuthRoute.post(
  "/face-analysis-status",
  faceAnalysisStatus
);
