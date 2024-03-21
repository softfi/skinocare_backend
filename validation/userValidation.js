import {validationResult } from "express-validator";
import { responseWithoutData } from "../helpers/helper.js";

export const userValidation = (req, res , next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            msg: errors?.array()[0]?.msg
        });

    }else{
        next();
    }
}

export const uploadImageValdator = (req, res, next) => {
    if (req.body.type === "ImageAnalysis") {
        if (req.file) {
            next();
        } else {
            responseWithoutData(res, 400, false, "Image field is required");
        }
    }else if(req.body.type === "Chat"){
        if (req.file) {
            next();
        } else {
            responseWithoutData(res, 400, false, "Image field is required");
        }
    } else {
        responseWithoutData(res, 400, false, "Type must be ImageAnalysis or Chat");
    }
}

// export const userRegisterValidations = [
//         body('name', 'Name field is Required').notEmpty().isLength({min: 3}).withMessage('Name should have Minimum 3 Characters'),
//         body('email', 'Email field is Required').notEmpty().isEmail().withMessage('Invaild Email').custom(async(email)=>{
//             const user = await User.findOne({email:email});
//             if (user) {
//               throw new Error('Email already in Exist');
//             }
//         }),
//         body('mobile', 'Mobile No field is Required').notEmpty().isNumeric().withMessage('Mobile should Numaric Characters').isLength({min: 10, max: 10}).withMessage('Mobile No should have 10 Number'),  
//         body('dob', 'DOB field is Required').notEmpty(),
//         body('password', 'Password field is Required').notEmpty().isLength({min:6, max:16}).withMessage('Password must be between 6 to 16 characters'),
//         body('confirm_password').custom(async (confirm_password, {req}) => {
//                 const password = req.body.password.trim();
//                 if(password !== confirm_password.trim()){
//                   throw new Error('Passwords must be same')
//                 }
//             }),
//     ] 


// export const userLoginValidations = [ body('email', 'Email field is Required').notEmpty().isEmail(),
//         body('password', 'Password field is Required').notEmpty()];