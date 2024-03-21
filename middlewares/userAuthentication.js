import jwt from "jsonwebtoken";
import { JWT_SECRET_TOKEN } from "../config/config.js";
import { errorLog } from "../config/logger.js";
import { authValues, errorResponse, responseWithoutData } from "../helpers/helper.js";


export const userAuthentication = (req, res, next) => {
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
                if (decoded && decoded.type === "customer") {
                    if (decoded.isActive === true) {
                        if (decoded.isEmailVerify === true || decoded.isMobileVerify === true) {
                            next();
                        } else {
                            if (req.url === '/verify-otp' || req.url === '/resend-otp') {
                                next();
                            } else {
                                return res.status(401).send({ status: false, msg: "Please Verify Your Email Id Or Mobile No" });
                            }
                        }
                    } else {
                        return res.status(401).send({ status: false, msg: "User is Inactive Please Contact Us" });
                    }
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

export const userSocket = async (socket, next) => {
    try {
        const token = socket?.handshake?.query?.authToken;
        const type = socket?.handshake?.headers['type'];

        if (!token) {
            socket.disconnect();
            return;
        }

        const userId = await jwt.verify(token, JWT_SECRET_TOKEN);

        if (!userId) {
            socket.disconnect();
            return;
        }

        const decoded = await authValues(token);


        // Check if the decoded user is either a customer or a doctor
        if ((decoded.type === 'customer' || decoded.type === 'doctor') && decoded.isActive) {
            // Check if the decoded user is a customer with email or mobile verified, or a doctor
            if ((decoded.type === 'customer' && (decoded.isEmailVerify || decoded.isMobileVerify))) {
                socket.customerId = decoded._id;
                socket.type = decoded.type;
                next();
            } else if (decoded.type === 'doctor') {
                // If the decoded user is a doctor, set the doctorId on the socket object
                socket.doctorId = decoded._id;
                socket.type = decoded.type;
                next();
            } else {
                socket.disconnect();
            }
        } else {
            socket.disconnect();
        }

    } catch (err) {
        errorLog(err);
        socket.disconnect();
    }
};



