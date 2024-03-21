import jwt from "jsonwebtoken";
import { JWT_SECRET_TOKEN } from "../config/config.js";
import { errorLog } from "../config/logger.js";
import { authValues, errorResponse, responseWithoutData } from "../helpers/helper.js";

export const adminAuthentication = (req, res, next) => {
    try {
        const token = req.headers['authorization'];
        if (!token) {
            return responseWithoutData(res, 401, false, "Unauthorized");
        }
        jwt.verify(token, JWT_SECRET_TOKEN, async function (err, userId) {
            if (err) {
                return res.status(401).send({ status: false, msg: "Token Expired" });
            } else {
                var decoded = await authValues(token);
                if (decoded && decoded.type === "admin") {
                    next();
                } else {
                    return res.status(401).send({ status: false, msg: "Invalid Token" });
                }
            }
        });
    } catch (err) {
        errorLog(err);
        errorResponse(res);
    }
}