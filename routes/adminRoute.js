import express from "express";
import { body, param } from "express-validator";
import bcrypt from "bcrypt";
export const adminRoute = express.Router();
export const adminAuthRoute = express.Router();

/***************************
        CUSTOM IMPORTS
 ****************************/
import {
  adminValiation,
  uploadImageValdator,
  uploadMultipleImageValdator,
  uploadVideoValdator,
} from "../validation/adminValidation.js";
import {
  adminLogin,
  getAdminProfileDetails,
  updateAdminProfile,
} from "../controllers/admin/authController.js";
import {
  addMenus,
  adminMenusList,
  deleteMenus,
} from "../controllers/admin/menuController.js";
import {
  addRole,
  deleteRole,
  getRoleById,
  roleList,
  updateRole,
} from "../controllers/admin/roleController.js";
import {
  addProduct,
  adminProductList,
  deleteProduct,
  getProductById,
  updateProduct,
} from "../controllers/admin/productController.js";
import {
  addCategory,
  adminCategoryList,
  deleteCategory,
  getCategoryById,
  updateCategory,
} from "../controllers/admin/categoryController.js";
import {
  uploadImage,
  uploadMultipleImage,
  uploadVideo,
} from "../controllers/admin/uploadController.js";
import { multerImageUpload, multerVideoUpload } from "../config/config.js";
import Upload from "../models/Upload.js";
import { authValues, responseWithoutData } from "../helpers/helper.js";
import {
  addFaq,
  deleteFaq,
  faqsList,
  getFaqById,
  updateFaq,
} from "../controllers/admin/faqController.js";
import {
  addTestimonial,
  deleteTestimonial,
  getTestimonialById,
  testimonialList,
  updateTestimonial,
} from "../controllers/admin/testimonialController.js";
import {
  addPage,
  deletePage,
  getPageById,
  isPageSlugUnique,
  isPageSlugUniqueUpdate,
  pageList,
  updatePage,
} from "../controllers/admin/pageController.js";
import {
  assignPermissionsToRole,
  getPermissionByRole,
} from "../controllers/admin/permissionController.js";
import {
  addNutrition,
  deleteNutrition,
  getNutritionById,
  nutritionList,
  updateNutrition,
} from "../controllers/admin/nutritionController.js";
import {
  addDoctor,
  deleteDoctor,
  doctorList,
  getDoctorById,
  updateDoctor,
} from "../controllers/admin/doctorController.js";
import User from "../models/User.js";
import {
  addAndUpdateValue,
  addType,
  getSettings,
} from "../controllers/admin/settingController.js";
import Setting from "../models/Setting.js";
import {
  addCoupon,
  couponList,
  deleteCoupon,
  getCouponById,
  updateCoupon,
} from "../controllers/admin/couponController.js";
import Coupon from "../models/Coupon.js";
import {
  addCaseStudy,
  caseStudiesList,
  deleteCaseStudy,
  getCaseStudyById,
  updateCaseStudy,
} from "../controllers/admin/caseStudyController.js";
import {
  orderDetails,
  orderList,
} from "../controllers/admin/orderController.js";
import { dispatchForm } from "../controllers/admin/shippingController.js";
import {
  addExplore,
  deleteExplore,
  exploreList,
  getExploreById,
  updateExplore,
} from "../controllers/admin/exploreController.js";
import {
  addDocter,
  docterList,
  getDoctorById as getDoctor,
  updateDoctor as updateWebDoctor,
  deleteDoctor as deleteWebDoctor,
} from "../controllers/admin/webDoctorController.js";
import {
  feedbackList,
  getFeedbackByUserId,
} from "../controllers/admin/feedbackController.js";
import {
  addSkinocareJourney,
  deleteSkinocareJourney,
  getSkinocareJourneyById,
  getSkinocareJourneyList,
  updateSkinocareJourney,
} from "../controllers/admin/skinocareJourneyController.js";
import {
  addSkinAndHair,
  deleteSkinAndHair,
  getSkinAndHairById,
  skinAndHairList,
  updateSkinAndHair,
} from "../controllers/admin/SkinAndHairController.js";
import DoctorDetail from "../models/DoctorDetail.js";
import {
  deleteCustomer,
  getCustomerById,
  getCustomerList,
  updateCustomer,
} from "../controllers/admin/customerController.js";
import {
  addDesignation,
  deleteDesignation,
  designationList,
  getDesignationById,
  updateDesignation,
} from "../controllers/admin/designationController.js";
import {
  addChatbotMessage,
  updateNextMessageId,
} from "../controllers/admin/chatbotMessageController.js";
import {
  addSymtom,
  deleteSymtom,
  getSymtomById,
  symtomList,
  updateSymtom,
} from "../controllers/admin/symtomController.js";
import Product from "../models/Product.js";
import {
  addKit,
  deleteKit,
  getKitById,
  kitList,
  updateKit,
} from "../controllers/admin/kitController.js";
import { userDetails } from "../controllers/user/userProfileController.js";
import { walletHistoryList } from "../controllers/user/walletHistoryController.js";
import { addDietConsultation, deleteDietConsultation, dietConsultationList, getDietConsultationById, updateDietConsultation } from "../controllers/admin/DietConsultationController.js";
import { addPlan, adminPlanList, deletePlan, getPlanById, updatePlan } from "../controllers/admin/planController.js";
import { notificationList, sendPushNotificationAdmin } from "../controllers/admin/notificationController.js";
import { patientListWithCallStatus } from "../controllers/admin/patientController.js";

/***************************
        Admin Login
***************************/

adminRoute.post(
  "/login",
  [
    body("email", "Email field is Required").notEmpty().isEmail(),
    body("password", "Password field is Required").notEmpty(),
  ],
  adminValiation,
  adminLogin
);

/****************************
  ADMIN AUTHENTICATED ROUTES 
*****************************/

/***************************
    Admin Profile
***************************/

adminAuthRoute.get("/profile", getAdminProfileDetails);

adminAuthRoute.post(
  "/profile",
  [
    body("image").optional(),
    body("oldPassword").custom(async (oldPassword, { req }) => {
      let admin = await authValues(req.headers["authorization"]);
      if (oldPassword && !(await bcrypt.compare(oldPassword, admin.password))) {
        throw new Error(`old Password does't Matched`);
      }
      return true;
    }),
    body("newPassword").optional(),
    body("confirmPassword").custom(async (confirmPassword, { req }) => {
      if (confirmPassword && confirmPassword.trim() === "") {
        throw new Error(`Password and Confirm Password Feild is required`);
      }
      if (
        req?.body?.newPassword &&
        req?.body?.newPassword.trim() !== confirmPassword.trim()
      ) {
        throw new Error("Password and Confirm Password must be same");
      }
      return true;
    }),
    body("image").optional(),
    body("name").notEmpty().withMessage("Name field is Required!"),
    body("email").notEmpty().withMessage("Email field is Required!"),
    body("mobile").notEmpty().withMessage("Mobile field is Required!"),
  ],
  adminValiation,
  updateAdminProfile
);

/************************  Menus Routes ************************/

adminAuthRoute.get("/menus-list", adminMenusList);
adminAuthRoute.post(
  "/add-menus",
  [
    body("name", "name feild is required").notEmpty(),
    body("url", "url feild is required").notEmpty(),
    body("icon", "icon feild is required").notEmpty(),
    body("parentId", "parentId feild is required").optional(),
    body("sortOrder", "sort order feild is required").notEmpty(),
    body("for", "for feild is required")
      .notEmpty()
      .custom(async (value) => {
        if (value === "customer" || value === "admin") {
          return true;
        } else {
          throw new Error('for should only have "customer" and "admin"');
        }
      }),
  ],
  adminValiation,
  addMenus
);

adminAuthRoute.delete(
  "/soft-delete",
  [body("menuId", "Menu Id Field Is Required").notEmpty()],
  adminValiation,
  deleteMenus
);

/************************  ROLES ROUTES START ************************/

adminAuthRoute.get("/roles", roleList);

adminAuthRoute.post(
  "/roles",
  [body("name", "Name field is Required").notEmpty()],
  adminValiation,
  addRole
);

adminAuthRoute.get("/roles/:roleId", getRoleById);

adminAuthRoute.put(
  "/roles",
  [
    body("roleId").notEmpty().withMessage("Role Id field is Required"),
    body("name").notEmpty().withMessage("Name field is Required"),
    body("isActive").optional(),
  ],
  adminValiation,
  updateRole
);

adminAuthRoute.delete(
  "/roles",
  [body("roleId").notEmpty().withMessage("Role Id field is Required")],
  adminValiation,
  deleteRole
);

/************************  ROLES ROUTES END ************************/

/************************  PERMISSION ROUTES START ************************/

adminAuthRoute.post("/get-permission-by-role", getPermissionByRole);

adminAuthRoute.post("/assign-permissions", assignPermissionsToRole);

/************************  PERMISSION ROUTES END ************************/

/************************  CATEGORIES ROUTES START ************************/

adminAuthRoute.get("/categories", adminCategoryList);

adminAuthRoute.get("/categories/:categoryId", getCategoryById);

adminAuthRoute.post(
  "/categories",
  [
    body("name", "Name field is Required").notEmpty(),
    body("type")
      .notEmpty()
      .withMessage("Type field is Required")
      .custom((value) => {
        if (
          value === "category" ||
          value === "concern" ||
          value === "productType" ||
          value === "faq"
        ) {
          return true;
        }
        throw new Error("type must be category, concern, productType or faq");
      }),
    body("imageId").custom(async (imageId) => {
      let image = await Upload.findById(imageId);
      if (image) {
        if (image.relatedWith === "Category") {
          return true;
        } else {
          throw new Error("Image Belong to Different Category");
        }
      } else {
        throw new Error("Image Not found!");
      }
    }),
  ],
  adminValiation,
  addCategory
);

adminAuthRoute.put(
  "/categories",
  [
    body("categoryId", "Category Id field is Required").notEmpty(),
    body("type")
      .notEmpty()
      .withMessage("Type field is Required")
      .custom((value) => {
        if (
          value === "category" ||
          value === "concern" ||
          value === "productType" ||
          value === "faq"
        ) {
          return true;
        }
        throw new Error("type must be category, concern, productType or faq");
      }),
    body("name", "Name field is Required").notEmpty(),
    body("imageId")
      .optional()
      .custom(async (imageId) => {
        let image = await Upload.findById(imageId);
        if (image) {
          if (image.relatedWith === "Category") {
            return true;
          } else {
            throw new Error("Image Belong to Different Category");
          }
        } else {
          throw new Error("Image Not found!");
        }
      }),
  ],
  adminValiation,
  updateCategory
);

adminAuthRoute.delete("/categories/:categoryId", deleteCategory);

/************************  CATEGORIES ROUTES END ************************/

/************************  PRODUCT ROUTES START ************************/

adminAuthRoute.get("/product-list", adminProductList);
adminAuthRoute.post(
  "/add-product",
  [
    body("name", "Name Field is required").notEmpty(),
    body("thumbnail", "Thumbnail Field is required").notEmpty(),
    body("images", "Images Field is required").notEmpty().isArray(),
    body("categoryId", "Category Field is required").notEmpty(),
    body("price", "Price Field is required").notEmpty().isNumeric(),
    body("discountType", "Discount Type Field is required").notEmpty(),
    body("discount", "Discount Field is required").notEmpty().isNumeric(),
    body("gst", "GST Field is required").notEmpty().isNumeric(),
    body("slug", "Slug Field is required")
      .notEmpty()
      .custom(async (slug) => {
        const user = await Product.findOne({ slug: slug, isDeleted: false });
        if (user) {
          throw new Error("slug already in Exist");
        } else {
          return true;
        }
      }),
    body("ingredients", "Ingredients Field is required").notEmpty(),
    body("indications", "Indications Field is required").notEmpty(),
    body("disclaimer", "Disclaimer Field is required").notEmpty(),
    body("specifictation", "Specifictation Field is required").notEmpty(),
    body("howToUse", "How To Use Field is required").notEmpty(),
    body("whenToUse", "How To Use Field is required").notEmpty(),
    body("refundable", "Refundable Field is required").notEmpty().isBoolean(),
    body("currentStock", "CurrentStock Field is required")
      .notEmpty()
      .isNumeric(),
    // body('title', 'Title Field is required').notEmpty(),
    body("description", "Description Field is required").notEmpty(),
    body("metaTitle", "Meta Title Field is required").notEmpty(),
    body("metaDescription", "Meta Description Field is required").notEmpty(),
  ],
  adminValiation,
  addProduct
);

adminAuthRoute.post(
  "/get-product-by-id",
  [body("productId", "Product Id field is required").notEmpty()],
  adminValiation,
  getProductById
);

adminAuthRoute.post(
  "/update-product",
  [
    body("productId", "Product id Field is required").notEmpty(),
    body("name", "Name Field is required").notEmpty(),
    body("categoryId", "Category Field is required").notEmpty(),
    body("price", "Price Field is required").notEmpty().isNumeric(),
    body("discountType", "DiscountType Field is required").notEmpty(),
    body("discount", "Discount Field is required").notEmpty().isNumeric(),
    body("slug", "Slug Field is required")
      .notEmpty()
      .custom(async (slug, { req }) => {
        const user = await Product.findOne({
          slug: slug,
          _id: { $ne: req?.body?.productId },
          isDeleted: false
        });
        if (user) {
          throw new Error("slug already in Exist");
        } else {
          return true;
        }
      }),
    body("ingredients", "Ingredients Field is required").notEmpty(),
    body("indications", "Indications Field is required").notEmpty(),
    body("disclaimer", "Disclaimer Field is required").notEmpty(),
    body("specifictation", "Specifictation Field is required").notEmpty(),
    body("howToUse", "How To Use Field is required").notEmpty(),
    body("whenToUse", "When To Use Field is required").notEmpty(),
    body("refundable", "Refundable Field is required").notEmpty().isBoolean(),
    body("currentStock", "CurrentStock Field is required")
      .notEmpty()
      .isNumeric(),
    // body('title', 'Title Field is required').notEmpty(),
    body("description", "Description Field is required").notEmpty(),
    body("metaTitle", "MetaTitle Field is required").notEmpty(),
    body("metaDescription", "MetaDescription Field is required").notEmpty(),
  ],
  adminValiation,
  updateProduct
);

adminAuthRoute.post(
  "/delete-product",
  [body("productId", "Product Id field is required").notEmpty()],
  adminValiation,
  deleteProduct
);

/************************  PRODUCT ROUTES END ************************/

/************************  UPLOADS ROUTES START ************************/

adminAuthRoute.post(
  "/upload-image",
  multerImageUpload.single("image"),
  uploadImageValdator,
  uploadImage
);

adminAuthRoute.post(
  "/upload-multiple-image",
  multerImageUpload.array("images", 10),
  uploadMultipleImageValdator,
  uploadMultipleImage
);

adminAuthRoute.post(
  "/upload-video",
  multerVideoUpload.single("video"),
  uploadVideoValdator,
  uploadVideo
);

/************************  UPLOADS ROUTES END ************************/

/************************  FAQs ROUTES START ************************/

adminAuthRoute.get("/faqs", faqsList);

adminAuthRoute.get("/faqs/:faqId", getFaqById);

adminAuthRoute.post(
  "/faqs",
  [
    body("categoryId").notEmpty().withMessage("Category Id Field is required"),
    body("question").notEmpty().withMessage("Question field is required"),
    body("answer").notEmpty().withMessage("Answer field is required"),
  ],
  adminValiation,
  addFaq
);

adminAuthRoute.put(
  "/faqs",
  [
    body("faqId").notEmpty().withMessage("FAQ ID field is required"),
    // body('categoryId').notEmpty().withMessage('Category Id Field is required'),
    body("question").notEmpty().withMessage("Question field is required"),
    body("answer").notEmpty().withMessage("Answer field is required"),
  ],
  adminValiation,
  updateFaq
);

adminAuthRoute.delete("/faqs/:faqId", deleteFaq);

/************************  FAQs ROUTES END ************************/

/************************  TESTIMONIALS ROUTES START ************************/

adminAuthRoute.get("/testimonial", testimonialList);

adminAuthRoute.get("/testimonial/:testimonialId", getTestimonialById);

adminAuthRoute.post(
  "/testimonial",
  [
    body("name").notEmpty().withMessage("Name field is required"),
    body("age").notEmpty().withMessage("Age field is required"),
    body("title").notEmpty().withMessage("Title field is required"),
    body("address").notEmpty().withMessage("Address field is required"),
    body("description").notEmpty().withMessage("Description field is required"),
    body("image")
      .notEmpty()
      .withMessage("Image field is required")
      .custom(async (value) => {
        let image = await Upload.findById(value);
        if (image) {
          if (image.relatedWith === "Testimonial") {
            return true;
          } else {
            throw new Error("Image Belong to Different Category");
          }
        } else {
          throw new Error("Image Not found!");
        }
      }),
  ],
  adminValiation,
  addTestimonial
);

adminAuthRoute.put(
  "/testimonial",
  [
    body("testimonialId", "Testimonial id field is required").notEmpty(),
    body("name").notEmpty().withMessage("Name field is required"),
    body("age").notEmpty().withMessage("Age field is required"),
    body("title").notEmpty().withMessage("Title field is required"),
    body("address").notEmpty().withMessage("Address field is required"),
    body("description").notEmpty().withMessage("Description field is required"),
    body("image").custom(async (value) => {
      let image = await Upload.findById(value);
      if (image) {
        if (image.relatedWith === "Testimonial") {
          return true;
        } else {
          throw new Error("Image Belong to Different Category");
        }
      }
      return true;
    }),
  ],
  adminValiation,
  updateTestimonial
);

adminAuthRoute.delete("/testimonial/:testimonialId", deleteTestimonial);

/************************  TESTIMONIALS ROUTES END ************************/

/************************  PAGES ROUTES START ************************/

adminAuthRoute.get("/page", pageList);

adminAuthRoute.post(
  "/page",
  [
    body("name").notEmpty().withMessage("Name Field Is Required!"),
    body("content").notEmpty().withMessage("Content Field Is Required!"),
    body("slug")
      .notEmpty()
      .withMessage("Slug Field Is Required!")
      .custom(async (value) => {
        if (!(await isPageSlugUnique(value))) {
          throw new Error("Slug must be unique");
        }
        return true;
      }),
  ],
  adminValiation,
  addPage
);

adminAuthRoute.get("/page/:pageId", getPageById);

adminAuthRoute.put(
  "/page",
  [
    body("pageId").notEmpty().withMessage("Page Id Field Is Required!"),
    body("name").notEmpty().withMessage("Name Field Is Required!"),
    body("content").notEmpty().withMessage("Content Field Is Required!"),
    body("slug")
      .notEmpty()
      .withMessage("Slug Field Is Required!")
      .custom(async (value, { req }) => {
        if (!(await isPageSlugUniqueUpdate(req.body.pageId, value))) {
          throw new Error("Slug must be unique");
        }
        return true;
      }),
    body("isActive").optional(),
  ],
  adminValiation,
  updatePage
);

adminAuthRoute.delete("/page/:pageId", deletePage);

/************************  PAGES ROUTES END ************************/

/************************  NUTRITION ROUTES START ************************/

adminAuthRoute.get("/nutrition", nutritionList);

adminAuthRoute.post(
  "/nutrition",
  [
    body("title").notEmpty().withMessage("title field is required"),
    body("content").notEmpty().withMessage("content field is required"),
  ],
  adminValiation,
  addNutrition
);

adminAuthRoute.get("/nutrition/:nutritionId", getNutritionById);

adminAuthRoute.put(
  "/nutrition",
  [
    body("nutritionId")
      .notEmpty()
      .withMessage("nutrition id field is required"),
    body("title").notEmpty().withMessage("title field is required"),
    body("content").notEmpty().withMessage("content field is required"),
  ],
  adminValiation,
  updateNutrition
);

adminAuthRoute.delete(
  "/nutrition",
  [
    body("nutritionId")
      .notEmpty()
      .withMessage("nutrition id field is required"),
  ],
  adminValiation,
  deleteNutrition
);

/************************  NUTRITION ROUTES END ************************/

/************************  DOCTOR ROUTES START ************************/

adminAuthRoute.get("/doctors", doctorList);

adminAuthRoute.post(
  "/doctors",
  [
    body("name")
      .notEmpty()
      .withMessage("Name field is Required")
      .isLength({ min: 3 })
      .withMessage("Name should have Minimum 3 Characters"),
    body("email")
      .notEmpty()
      .withMessage("Email field is Required")
      .isEmail()
      .withMessage("PLease Enter Vaild Email")
      .custom(async (email) => {
        const doctor = await User.findOne({ email: email, isDeleted: false });
        const doctorDetail = await DoctorDetail.findOne({ email: email, isDeleted: false });
        if (doctor || doctorDetail) {
          throw new Error("Email already in Exist");
        }
      }),
    body("password")
      .notEmpty()
      .withMessage("Password field is Required")
      .isLength({ min: 5 })
      .withMessage("Password should have Minimum 5 Characters"),
    body("mobile")
      .notEmpty()
      .withMessage("Mobile No field is Required")
      .isNumeric()
      .withMessage("Mobile should Numaric Characters")
      .isLength({ min: 10, max: 10 })
      .withMessage("Mobile No should have 10 Number")
      .custom(async (mobile) => {
        const doctor = await User.findOne({ mobile: mobile, isDeleted: false });
        const doctorDetail = await DoctorDetail.findOne({ mobile: mobile, isDeleted: false });
        if (doctor || doctorDetail) {
          throw new Error("Mobile already in Exist");
        }
      }),
    body("specialisation")
      .notEmpty()
      .withMessage("Specialisation field is Required"),
    body("designation").notEmpty().withMessage("Designation field is Required"),
    body("aboutYou")
      .notEmpty()
      .withMessage("About You field is Required")
      .isArray()
      .withMessage("About You should be Array"),
    body("medicalCouncilRegNumber")
      .notEmpty()
      .withMessage("Medical Council Reg Number field is Required"),
    body("qualifications")
      .notEmpty()
      .withMessage("Qualifications field is Required"),
    body("knowAboutMe")
      .notEmpty()
      .withMessage("Know About Me field is Required"),
    body("alternativeMobile")
      .notEmpty()
      .withMessage("Alternative Mobile field is Required")
      .isNumeric()
      .withMessage("Alternative Mobile should Numaric Characters")
      .isLength({ min: 10, max: 10 })
      .withMessage("Alternative Mobile No should have 10 Number"),
    body("pincode")
      .notEmpty()
      .withMessage("Pincode field is Required")
      .isNumeric()
      .withMessage("Mobile should Numaric Characters"),
    body("district").notEmpty().withMessage("District field is Required"),
    body("area").notEmpty().withMessage("Area field is Required"),
    body("streetName").notEmpty().withMessage("Street Name field is Required"),
    body("houseNumber")
      .notEmpty()
      .withMessage("House Number field is Required"),
    body("landmark").notEmpty().withMessage("Landmark field is Required"),
    body("patientHandled")
      .notEmpty()
      .withMessage("Patient Handled field is Required"),
    body("isHod")
      .notEmpty()
      .withMessage("Is Hod field is Required")
      .isBoolean("Is Hod should be Boolean"),
  ],
  adminValiation,
  addDoctor
);

adminAuthRoute.get("/doctors/:doctorId", getDoctorById);

adminAuthRoute.put(
  "/doctors",
  [
    body("doctorId")
      .notEmpty()
      .withMessage("Doctor Id field is Required")
      .isLength({ min: 3 })
      .withMessage("Name should have Minimum 3 Characters"),
    body("name")
      .notEmpty()
      .withMessage("Name field is Required")
      .isLength({ min: 3 })
      .withMessage("Name should have Minimum 3 Characters"),
    body("email")
      .notEmpty()
      .withMessage("Email field is Required")
      .isEmail()
      .withMessage("Invaild Email")
      .custom(async (email, { req }) => {
        const doctor = await DoctorDetail.findOne({
          _id: { $ne: req.body.doctorId },
          email: email,
          isDeleted: false
        });
        // const doctorDetail = await User.findOne({ email: email ,isDeleted:false,_id:{ $ne: req.body.userId }});
        // if (doctor || doctorDetail) {
        if (doctor) {
          throw new Error("Email already in Exist");
        }
      }),
    body("mobile")
      .notEmpty()
      .withMessage("Mobile No field is Required")
      .isNumeric()
      .withMessage("Mobile should Numaric Characters")
      .isLength({ min: 10, max: 10 })
      .withMessage("Mobile No should have 10 Number")
      .custom(async (mobile, { req }) => {
        const doctor = await DoctorDetail.findOne({
          _id: { $ne: req.body.doctorId },
          mobile: mobile,
          isDeleted: false
        });
        // const doctorDetail = await User.findOne({ mobile: mobile ,isDeleted:false,_id:{ $ne: req.body.userId }});
        // if (doctor || doctorDetail) {
        if (doctor) {
          throw new Error("Mobile already in Exist");
        }
      }),
    body("specialisation")
      .notEmpty()
      .withMessage("Specialisation field is Required"),
    body("designationId").notEmpty().withMessage("Designation field is Required"),
    body("aboutYou")
      .notEmpty()
      .withMessage("About You field is Required")
      .isArray()
      .withMessage("About You should be Array"),
    body("medicalCouncilRegNumber")
      .notEmpty()
      .withMessage("Medical Council Reg Number field is Required"),
    body("qualifications")
      .notEmpty()
      .withMessage("Qualifications field is Required"),
    body("knowAboutMe")
      .notEmpty()
      .withMessage("Know About Me field is Required"),
    body("alternativeMobile")
      .notEmpty()
      .withMessage("Alternative Mobile field is Required")
      .isNumeric()
      .withMessage("Alternative Mobile should Numaric Characters")
      .isLength({ min: 10, max: 10 })
      .withMessage("Alternative Mobile No should have 10 Number"),
    body("pincode")
      .notEmpty()
      .withMessage("Pincode field is Required")
      .isNumeric()
      .withMessage("Mobile should Numaric Characters"),
    body("district").notEmpty().withMessage("District field is Required"),
    body("area").notEmpty().withMessage("Area field is Required"),
    body("streetName").notEmpty().withMessage("Street Name field is Required"),
    body("houseNumber")
      .notEmpty()
      .withMessage("House Number field is Required"),
    body("landmark").notEmpty().withMessage("Landmark field is Required"),
    body("patientHandled")
      .notEmpty()
      .withMessage("Patient Handled field is Required"),
    body("isHod")
      .notEmpty()
      .withMessage("Is Hod field is Required")
      .isBoolean("Is Hod should be Boolean"),
  ],
  adminValiation,
  updateDoctor
);

adminAuthRoute.delete("/doctors/:doctorId", deleteDoctor);

/************************  DOCTOR ROUTES END ************************/

/************************  SETTING ROUTES START ************************/

adminAuthRoute.get("/settings", getSettings);

adminAuthRoute.post(
  "/settings/type",
  [
    body("type")
      .notEmpty()
      .withMessage("Type field is required")
      .custom(async (type) => {
        let setting = await Setting.findOne({ type });
        if (setting) {
          throw new Error("Type is Already Exists");
        }
        return true;
      }),
  ],
  adminValiation,
  addType
);

adminAuthRoute.post(
  "/settings/value",
  [
    body("type").notEmpty().withMessage("Type field is required"),
    body("value").notEmpty().withMessage("Value field is required"),
  ],
  adminValiation,
  addAndUpdateValue
);

/************************  SETTING ROUTES END ************************/

//**********************  COUPON ROUTES START *********************/

adminAuthRoute.get("/coupons", couponList);

adminAuthRoute.post(
  "/coupons",
  [
    body("code")
      .notEmpty()
      .withMessage("Code  field is Required")
      .custom(async (code) => {
        const coupon = await Coupon.findOne({ code: code });
        if (coupon) {
          throw new Error("Code is already exist");
        } else {
          return true;
        }
      }),
    body("type").notEmpty().withMessage("Type  field is Required"),
    body("limit")
      .optional()
      .isNumeric({ min: 0 })
      .withMessage("Limit  Must be a Number")
      .isInt({ min: 1 })
      .withMessage("limit must greater than or equal to 1"),
    body("discountUpTo")
      .optional()
      .isNumeric({ min: 0 })
      .withMessage("Discount upto  Must be a Number")
      .isInt({ min: 1 })
      .withMessage("Discount upto must greater than or equal to 1"),
    body("discount")
      .notEmpty()
      .withMessage("discount  field is Required")
      .isNumeric()
      .withMessage("discount should Numaric Characters"),
    body("expiredAt").notEmpty().withMessage("expiredAt  field is Required"),
  ],
  adminValiation,
  addCoupon
);

adminAuthRoute.get("/coupons/:couponId", getCouponById);

adminAuthRoute.put(
  "/coupons",
  [
    body("couponId").notEmpty().withMessage("Coupon Id field is Required"),
    body("code")
      .notEmpty()
      .withMessage("Code  field is Required")
      .custom(async (code, { req }) => {
        const coupon = await Coupon.findOne({
          _id: {
            $ne: req?.body?.couponId,
          },
          code: code,
        });
        if (coupon) {
          throw new Error("Code is already exist");
        } else {
          return true;
        }
      }),
    body("limit")
      .optional()
      .isNumeric({ min: 0 })
      .withMessage("Limit  Must be a Number")
      .isInt({ min: 1 })
      .withMessage("limit must greater than or equal to 1"),
    body("discountUpTo")
      .optional()
      .isNumeric({ min: 0 })
      .withMessage("Discount upto  Must be a Number")
      .isInt({ min: 1 })
      .withMessage("Discount upto must greater than or equal to 1"),
    body("type").notEmpty().withMessage("Type  field is Required"),
    body("discount")
      .notEmpty()
      .withMessage("discount  field is Required")
      .isNumeric()
      .withMessage("discount should Numaric Characters"),
    body("expiredAt").notEmpty().withMessage("expiredAt  field is Required"),
  ],
  adminValiation,
  updateCoupon
);

adminAuthRoute.delete("/coupons/:couponId", deleteCoupon);

//**********************  COUPON ROUTES END *********************/

/**********************  CASE STUDIES ROUTES START *********************/

adminAuthRoute.get("/case-study", caseStudiesList);

adminAuthRoute.post(
  "/case-study",
  [
    body("name").notEmpty().withMessage("Name field is Required"),
    body("imageId")
      .notEmpty()
      .withMessage("Image field is Required")
      .custom(async (imageId) => {
        let image = await Upload.findById(imageId);
        if (image) {
          if (image.relatedWith === "CaseStudy") {
            return true;
          } else {
            throw new Error("Image Belong to Different Category");
          }
        } else {
          throw new Error("Image Not found!");
        }
      }),
    body("age").notEmpty().withMessage("Age field is Required"),
    body("title").notEmpty().withMessage("Title field is Required"),
    body("description").notEmpty().withMessage("Description field is Required"),
    body("address").notEmpty().withMessage("Address field is Required"),
  ],
  adminValiation,
  addCaseStudy
);

adminAuthRoute.get("/case-study/:caseStudyId", getCaseStudyById);

adminAuthRoute.put(
  "/case-study",
  [
    body("caseStudyId")
      .notEmpty()
      .withMessage("Case Study Id field is Required"),
  ],
  adminValiation,
  updateCaseStudy
);

adminAuthRoute.delete("/case-study/:caseStudyId", deleteCaseStudy);

/**********************  CASE STUDIES ROUTES END *********************/

/**********************  ORDERS ROUTES START *********************/

adminAuthRoute.get("/orders", orderList);

adminAuthRoute.get("/orders/:orderId", orderDetails);

/**********************  ORDERS ROUTES END *********************/

/**********************  SHIPPING ROUTES START *********************/

adminAuthRoute.get("/shipping", dispatchForm);

/**********************  SHIPPING ROUTES END *********************/

/**********************  EXPLORE ROUTES START *********************/

adminAuthRoute.get("/explore", exploreList);

adminAuthRoute.post(
  "/explore",
  [
    body("title").notEmpty().withMessage("Title field is required"),
    body("upload").notEmpty().withMessage("Upload field is required"),
    body("uploadType")
      .notEmpty()
      .withMessage("UploadType field is required")
      .custom(async (uploadType) => {
        if (uploadType === "image" || uploadType === "video") {
          return true;
        }
        throw new Error("Upload Type must image Or video");
      }),
    body("description").notEmpty().withMessage("Description field is required"),
  ],
  adminValiation,
  addExplore
);

adminAuthRoute.get("/explore/:exploreId", getExploreById);

adminAuthRoute.put(
  "/explore",
  [
    body("exploreId").notEmpty().withMessage("Explore Id field is required"),
    body("title").notEmpty().withMessage("Title field is required"),
    // body('upload').notEmpty().withMessage('Upload field is required'),
    body("uploadType").custom(async (uploadType) => {
      if (
        uploadType.trim() === "image" ||
        uploadType.trim() === "video" ||
        uploadType == undefined ||
        uploadType.trim() == ""
      ) {
        return true;
      }
      throw new Error("Upload Type must image Or video");
    }),
    body("description").notEmpty().withMessage("Description field is required"),
    body("isActive").notEmpty().withMessage("isActive field is required"),
  ],
  adminValiation,
  updateExplore
);

adminAuthRoute.delete("/explore/:exploreId", deleteExplore);

/**********************  EXPLORE ROUTES END *********************/

/**********************  WEB DOCTOR ROUTES START *********************/

adminAuthRoute.get("/web/doctor", docterList);

adminAuthRoute.post(
  "/web/doctor",
  [
    body("image").notEmpty().withMessage("Image field is required"),
    body("name").notEmpty().withMessage("Name field is required"),
    body("experties").notEmpty().withMessage("Experties field is required"),
    body("patientHandled")
      .notEmpty()
      .withMessage("Patient Handled field is required")
      .isNumeric()
      .withMessage("Patient Handled must be Numaric"),
    body("shortDescription")
      .notEmpty()
      .withMessage("Short Description field is required"),
    body("description").notEmpty().withMessage("Description field is required"),
  ],
  adminValiation,
  addDocter
);

adminAuthRoute.get("/web/doctor/:doctorId", getDoctor);

adminAuthRoute.put(
  "/web/doctor",
  [body("doctorId").notEmpty().withMessage("Doctor Id field is required")],
  adminValiation,
  updateWebDoctor
);

adminAuthRoute.delete("/web/doctor/:doctorId", deleteWebDoctor);

/**********************  WEB DOCTOR ROUTES END *********************/

/**********************  FEEDBACK ROUTES START *********************/

adminAuthRoute.get("/feedbacks", feedbackList);

adminAuthRoute.get("/feedbacks/:userId", getFeedbackByUserId);

/**********************  FEEDBACK ROUTES END *********************/
/**********************  USER DETAILS ROUTES START *********************/
adminAuthRoute.get("/user-details/:customerId", userDetails);

/**********************  USER DETAILS ROUTES END *********************/

/**********************  SkinOCare Journey ROUTES START *********************/

adminAuthRoute.get("/skinocare-journey", getSkinocareJourneyList);

adminAuthRoute.post(
  "/skinocare-journey",
  [
    body("name").notEmpty().withMessage("Name field is Required"),
    body("videoLink").notEmpty().withMessage("Video Link field is Required"),
  ],
  adminValiation,
  addSkinocareJourney
);

adminAuthRoute.get(
  "/skinocare-journey/:skinocareJourneyId",
  getSkinocareJourneyById
);

adminAuthRoute.put(
  "/skinocare-journey",
  [
    body("skinocareJourneyId")
      .notEmpty()
      .withMessage("Skinocare Journey Id field is Required"),
    body("name").notEmpty().withMessage("Name field is Required"),
    body("videoLink").notEmpty().withMessage("Video Link field is Required"),
    body("isActive").isBoolean().withMessage("isActive must be true Or false"),
  ],
  adminValiation,
  updateSkinocareJourney
);

adminAuthRoute.delete(
  "/skinocare-journey/:skinocareJourneyId",
  deleteSkinocareJourney
);

/**********************  SkinOCare Journey ROUTES END *********************/

/**********************  SKIN AND HAIR ROUTES END *********************/

adminAuthRoute.get("/skin-and-hair", skinAndHairList);

adminAuthRoute.post(
  "/skin-and-hair",
  [
    body("name").notEmpty().withMessage("Name field is Required"),
    body("topic").notEmpty().withMessage("Topic field is Required"),
    body("upload").notEmpty().withMessage("Upload field is Required"),
    body("uploadType")
      .notEmpty()
      .withMessage("Upload Type field is Required")
      .custom(async (uploadType) => {
        if (uploadType.trim() === "image" || uploadType.trim() === "video") {
          return true;
        }
        throw new Error("Upload Type must image Or video");
      }),
    body("type")
      .notEmpty()
      .withMessage("Type field is Required")
      .custom(async (type) => {
        if (type.trim() === "skin" || type.trim() === "hair") {
          return true;
        }
        throw new Error("Type must skin Or hair");
      }),
  ],
  adminValiation,
  addSkinAndHair
);

adminAuthRoute.get("/skin-and-hair/:skinAndHairId", getSkinAndHairById);

adminAuthRoute.put(
  "/skin-and-hair",
  [
    body("skinAndHairId")
      .notEmpty()
      .withMessage("Skin And Hair Id field is Required"),
    body("name").notEmpty().withMessage("Name field is Required"),
    body("topic").notEmpty().withMessage("Topic field is Required"),
    body("upload").notEmpty().withMessage("Upload field is Required"),
    body("uploadType")
      .notEmpty()
      .withMessage("Upload Type field is Required")
      .custom(async (uploadType) => {
        if (uploadType.trim() === "image" || uploadType.trim() === "video") {
          return true;
        }
        throw new Error("Upload Type must image Or video");
      }),
    body("type")
      .notEmpty()
      .withMessage("Type field is Required")
      .custom(async (type) => {
        if (type.trim() === "skin" || type.trim() === "hair") {
          return true;
        }
        throw new Error("Type must skin Or hair");
      }),
  ],
  adminValiation,
  updateSkinAndHair
);

adminAuthRoute.delete("/skin-and-hair/:skinAndHairId", deleteSkinAndHair);

/**********************  SKIN AND HAIR ROUTES END *********************/

/************************  CUSTOMER ROUTES START ************************/

adminAuthRoute.get("/customers", getCustomerList);

adminAuthRoute.get("/customers/:customerId", getCustomerById);

adminAuthRoute.put("/customers", updateCustomer);

adminAuthRoute.delete("/customers/:customerId", deleteCustomer);

/************************  CUSTOMER ROUTES END ************************/

/************************  DESIGNATION ROUTES START ************************/

adminAuthRoute.get("/designations", designationList);

adminAuthRoute.post(
  "/designations",
  [body("designation").notEmpty().withMessage("Designation field is Required")],
  adminValiation,
  addDesignation
);

adminAuthRoute.get("/designations/:designationId", getDesignationById);

adminAuthRoute.put(
  "/designations",
  [
    body("designationId")
      .notEmpty()
      .withMessage("Designation Id field is Required"),
    body("designation").notEmpty().withMessage("Designation field is Required"),
    body("isActive").optional(),
  ],
  adminValiation,
  updateDesignation
);

adminAuthRoute.delete("/designations/:designationId", deleteDesignation);

/************************  DESIGNATION ROUTES END ************************/

/************************  CHATBOT TEMP ROUTES START ************************/

adminRoute.post("/chatbot_message", addChatbotMessage);

adminRoute.post("/chatbot_message/update", updateNextMessageId);

/************************  CHATBOT TEMP ROUTES END ************************/

/************************  Symtom ROUTES START ************************/

adminAuthRoute.get("/symtom", symtomList);

adminAuthRoute.post(
  "/symtom",
  [
    body("name", "Name field is Required").notEmpty(),
    body("type", "Type field is Required").notEmpty(),
  ],
  adminValiation,
  addSymtom
);

adminAuthRoute.get("/symtom/:symtomId", getSymtomById);

adminAuthRoute.put(
  "/symtom",
  [
    body("symtomId").notEmpty().withMessage("Symtom Id field is Required"),
    body("name", "Name field is Required").notEmpty(),
    body("type", "Type field is Required").notEmpty(),
    body("isActive").optional(),
  ],
  adminValiation,
  updateSymtom
);

adminAuthRoute.delete(
  "/symtom/:symtomId",
  adminValiation,
  deleteSymtom
);

/************************  Symtom ROUTES END ************************/

/************************  KIT ROUTES START ************************/
adminAuthRoute.get("/kit", kitList);

adminAuthRoute.post(
  "/kit",
  [
    body("name", "Name field is Required").notEmpty(),
    body("price", "Price field is Required").notEmpty(),
    body("mrp", "Mrp field is Required").notEmpty(),
    body("image", "image field is Required").notEmpty(),
    body("instruction", "Instruction field is Required").notEmpty(),
    body("validity", "Validity field is Required").notEmpty(),
  ],
  adminValiation,
  addKit
);

adminAuthRoute.get("/kit/:kitId", getKitById);

adminAuthRoute.put(
  "/kit",
  [
    body("kitId").notEmpty().withMessage("Kit Id field is Required"),
    body("name", "Name field is Required").notEmpty(),
    body("price", "Price field is Required").notEmpty(),
    body("mrp", "Mrp field is Required").notEmpty(),
    body("instruction", "Instruction field is Required").notEmpty(),
    body("validity", "Validity field is Required").notEmpty(),
    body("isActive").optional(),
  ],
  adminValiation,
  updateKit
);

adminAuthRoute.delete(
  "/kit/:kitId",
  adminValiation,
  deleteKit
);

/************************  KIT ROUTES END ************************/

adminAuthRoute.get("/wallet-history", walletHistoryList);

/************************  Diet Consultation ROUTES START ************************/

adminAuthRoute.get("/diet", dietConsultationList);

adminAuthRoute.post(
  "/diet",
  [
    body("mrp", "Mrp field is Required").notEmpty(),
    body("payableAmount", "Payable Amount field is Required").notEmpty(),
  ],
  adminValiation,
  addDietConsultation
);

adminAuthRoute.get("/diet/:dietId", getDietConsultationById);

adminAuthRoute.put(
  "/diet",
  [
    // body("dietId").notEmpty().withMessage("Diet Id field is Required"),
    body("name", "Name field is Required").notEmpty(),
    body("mrp", "Mrp field is Required").notEmpty(),
    body("price", "Price field is Required").notEmpty(),
    body("isActive").optional(),
  ],
  adminValiation,
  updateDietConsultation
);

adminAuthRoute.delete(
  "/diet/:dietId",
  adminValiation,
  deleteDietConsultation
);

/************************  Diet Consultation ROUTES END ************************/

/***********************  KIT PLAN ROUTES START ***********************/

adminAuthRoute.get("/plans", adminPlanList);

adminAuthRoute.get("/plans/:planId", getPlanById);

adminAuthRoute.post(
  "/plans",
  [
    body("kitId", "KitId field is Required").notEmpty(),
    body("type")
      .notEmpty()
      .withMessage("Type field is Required")
      .custom((value) => {
        if (
          value === "Advance" ||
          value === "Pro" ||
          value === "Assist"
        ) {
          return true;
        }
        throw new Error("type must be Advance, Pro, Assist");
      }),
    body("title", "Title field is Required").notEmpty(),
    body("description", "Description field is Required").notEmpty(),
    body("imageId").custom(async (imageId) => {
      let image = await Upload.findById(imageId);
      if (image) {
        if (image.relatedWith === "Plan") {
          return true;
        } else {
          throw new Error("Image Belong to Different Category");
        }
      } else {
        throw new Error("Image Not found!");
      }
    }),
  ],
  adminValiation,
  addPlan
);

adminAuthRoute.put(
  "/plans",
  [
    body("planId", "planId field is Required").notEmpty(),
    body("kitId", "KitId field is Required").notEmpty(),
    body("type")
      .notEmpty()
      .withMessage("Type field is Required")
      .custom((value) => {
        if (
          value === "Advance" ||
          value === "Pro" ||
          value === "Assist"
        ) {
          return true;
        }
        throw new Error("type must be Advance, Pro, Assist");
      }),
    body("title", "Title field is Required").notEmpty(),
    body("description", "Description field is Required").notEmpty(),
    body("imageId").optional().custom(async (imageId) => {
      let image = await Upload.findById(imageId);
      if (image) {
        if (image.relatedWith === "Plan") {
          return true;
        } else {
          throw new Error("Image Belong to Different Category");
        }
      } else {
        throw new Error("Image Not found!");
      }
    }),
  ],
  adminValiation,
  updatePlan
);

adminAuthRoute.delete("/plans/:planId", deletePlan);

/***********************  KIT PLAN ROUTES END ***********************/


/**********************  NOTIFICATION ROUTES START **********************/

adminAuthRoute.post(
  "/send-push-notification",
  [
    body("title", "Title field is Required").notEmpty(),
    body("description", "Description field is Required").notEmpty(),
    body("imageId").optional().custom(async (imageId) => {
      let image = await Upload.findById(imageId);
      if (image) {
        if (image.relatedWith === "Notification") {
          return true;
        } else {
          throw new Error("Image Belong to Different Category");
        }
      } else {
        throw new Error("Image Not found!");
      }
    }),
  ],
  adminValiation,
  sendPushNotificationAdmin
);
adminAuthRoute.get(
  "/notification-list",
  notificationList
);

/**********************  NOTIFICATION ROUTES START **********************/


/**********************  NOTIFICATION ROUTES START **********************/

adminAuthRoute.get(
  "/patient-list-with-call-status",
  patientListWithCallStatus
);

/**********************  NOTIFICATION ROUTES START **********************/