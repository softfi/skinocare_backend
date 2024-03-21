import {validationResult } from "express-validator";
import { responseWithoutData } from "../helpers/helper.js";

export const doctorValidation = (req, res , next) => {
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