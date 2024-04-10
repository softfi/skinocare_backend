import express from "express";
import { body, param } from "express-validator";
import { doctorValidation } from "../validation/doctorValidation.js";
import bcrypt from "bcrypt";
import { doctorLogInUsingMobileNumber, verifyOtpDoctor, doctorUserLogIn, updateDoctorDetails, resendOtpDoctor, doctorAuthDetails, updateDoctorPassword } from "../controllers/doctor/doctorAuth.js";
import { authValues } from "../helpers/helper.js";
import { uploadImageValdator } from "../validation/adminValidation.js";
import { uploadImageDoctorSide } from "../controllers/admin/uploadController.js";
import { multerImageUpload } from "../config/config.js";
import { addPrescription, completeChat, deletePrescription, doctorDashboard, getAllKitsDoctor, getChatDetails, getKitByKitId, getKitDetails, getListAllUsers, getPrescriptionById, getPrescriptionList, updatePrescription } from "../controllers/doctor/doctorController.js";
import kit from "../models/kit.js";
export const doctorRoute = express.Router();
export const doctorAuthRoute = express.Router();

// Login using email 
doctorRoute.post(
  "/login",
  [
    body("email", "Email field is Required").notEmpty().isEmail(),
    body("password", "Password field is Required").notEmpty(),
  ],
  doctorValidation,
  doctorUserLogIn
);

// Login using mobile number
doctorRoute.post(
  "/doctorLoginUsingMobileNumber",
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
        if (req?.body?.type == "mobile") {
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
  doctorValidation,
  doctorLogInUsingMobileNumber
);

// Otp Verification 
doctorRoute.post('/verifyOtpDoctor',
  [
    body("type", "Type field is Required/Invaild Email")
      .notEmpty()
      .custom((item) => {
        if (item != "mobile") {
          throw Error("Type Only have selected Value Mobile!");
        }
        return true;
      }),
    body("value", "Mobile field is Required")
      .notEmpty()
      .custom((item, { req }) => {
        if (req?.body?.type == "mobile") {
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
  doctorValidation,
  verifyOtpDoctor
)

// Resend Otp 
doctorRoute.post(
  "/resend-otp",
  [
    body("type", "Type field is Required/Invaild Mobile Number")
      .notEmpty()
      .custom((item) => {
        if (item != "mobile") {
          throw Error("Type Only have selected Value Mobile !");
        }
        return true;
      }),
    body("value", "  Mobile field is Required")
      .notEmpty()
      .custom((item, { req }) => {
        if (req?.body?.type == "mobile") {
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
  doctorValidation,
  resendOtpDoctor
);

// Update Doctor Profile

doctorAuthRoute.put(
  "/update-doctor-details",
  [
    body("image").optional(),
    body("name").notEmpty().withMessage("Name field is Required"),
    body("email").notEmpty().withMessage("Email field is Required"),
    body("mobile").notEmpty().withMessage("Mobile field is Required"),
    body("specialisation").notEmpty().withMessage("Specialisation field is Required"),
    body("aboutYou").notEmpty().withMessage("About You field is Required"),
    body("medicalCouncilRegNumber").notEmpty().withMessage("Medical CouncilRegNumber field is Required"),
    body("qualifications").notEmpty().withMessage("Qualifications field is Required"),
    body("knowAboutMe").notEmpty().withMessage("Know About Me field is Required"),
    body("alternativeMobile").notEmpty().withMessage("Alternative Mobile field is Required"),
    body("pincode").notEmpty().withMessage("Pincode field is Required"),
    body("state").notEmpty().withMessage("State field is Required"),
    body("district").notEmpty().withMessage("District field is Required"),
    body("area").notEmpty().withMessage("Area field is Required"),
    body("streetName").notEmpty().withMessage("StreetName field is Required"),
    body("houseNumber").notEmpty().withMessage("House Number field is Required"),
    body("landmark").notEmpty().withMessage("Landmark field is Required"),
  ],
  doctorValidation,
  updateDoctorDetails
);

// Get Doctor Details
doctorAuthRoute.get("/doctor-details", doctorAuthDetails);

//Update Password

doctorAuthRoute.post(
  "/update-password",
  [

    body("oldPassword").custom(async (oldPassword, { req }) => {

      let doctor = await authValues(req.headers["authorization"]);
      if (oldPassword && !(await bcrypt.compare(oldPassword, doctor.password))) {
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

  ],
  doctorValidation,
  updateDoctorPassword
);

// Upload Image Doctor Side

doctorAuthRoute.post(
  "/upload-image-doctor-side",
  multerImageUpload.single("image"),
  uploadImageValdator,
  uploadImageDoctorSide
);

// Get All Users
doctorAuthRoute.get("/get-all-users", getListAllUsers);

// Get All Kits
doctorRoute.get("/get-all-kits", getAllKitsDoctor)

//Get Kit By KitId
doctorAuthRoute.post(
  "/get-kit-by-kitId",
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
  doctorValidation,
  getKitByKitId
);

// ******************** PRESCRIPTION ROUTES START *********************************************************************************

// Add Prescription Doctor side
doctorAuthRoute.post(
  "/prescription",
  [
    body("title", "Title field is Required").notEmpty(),
    body("description", "Description field is Required").notEmpty(),
  ],
  doctorValidation,
  addPrescription
);

// Get Prescription By Id
doctorAuthRoute.get("/prescription/:prescriptionId", getPrescriptionById);

// Get All Prescription
doctorAuthRoute.get("/getPrescriptionList", getPrescriptionList);

// Update Prescription 
doctorAuthRoute.put(
  "/prescription",
  [
    body("prescriptionId", "prescriptionId field is Required").notEmpty(),
    body("title", "Title field is Required").notEmpty(),
    body("description", "Description field is Required").notEmpty(),

  ],
  doctorValidation,
  updatePrescription
);

doctorAuthRoute.delete("/prescription/:prescriptionId", deletePrescription);

// ******************** PRESCRIPTION ROUTES END *************************************************************************

// Dashboard
doctorAuthRoute.get("/dashboard", doctorDashboard);


doctorRoute.post(
  "/get-Chat-Details",
  [
    body("id", "Id field is Required").notEmpty(),
  ],
  doctorValidation,
  getChatDetails
);

doctorRoute.put(
  "/chat-Complete",
  [
    body("conversationId", "conversationId field is Required").notEmpty(),

  ],
  doctorValidation,
  completeChat
);

doctorRoute.post(
  "/get-kit-details",
  [
    body("id", "Id field is Required").notEmpty(),
  ],
  doctorValidation,
  getKitDetails
);