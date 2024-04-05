import axios from "axios";
import { PHONEPE_CALLBACK_URL, PHONEPE_MERCHANT_ID, PHONEPE_REDIRECT_URL, PHONEPE_SALT_KEY } from "../../config/config.js";
import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import DietConsultation from "../../models/DietConsultation.js";
import DietSubscription from "../../models/DietSubscription.js";
import crypto from "crypto";
export const dietConsultationPayment = async (req, res) => {
    try {
        const { dietId, mobile } = req.body;
        const customer = await authValues(req.headers['authorization'])
        let dietPlan = await DietConsultation.findById(dietId);
        let payableAmount = Number(dietPlan?.payableAmount)?.toFixed(2);
        if (dietPlan) {
            console.log('dietPlan',dietPlan);
            const data = {
        amount: Number(payableAmount * 100),
                      //   amount: 100,
                mobileNumber: mobile?.toString(),
                phonepay_merchant_id: PHONEPE_MERCHANT_ID,
                phonepay_redirect_url: PHONEPE_REDIRECT_URL + "dietpayment/status",
                phonepay_callback_url:PHONEPE_CALLBACK_URL + "api/web/phonepe/callback-url/",
                salt_key: PHONEPE_SALT_KEY,
                environment: "production",
                name: customer?.name,
            };
            const prod_URL = "https://payments.jurysoftprojects.com/phonepay/payment";
            const options = {
                method: "POST",
                url: prod_URL,
                data: data,
            };
            axios
                .request(options)
                .then(async (response) => {
                    let dietSubscription = await DietSubscription.create({
                        customerId: customer?._id,
                        dietId: dietId,
                        paymentStatus: "unpaid",
                        transactionId: response.data.merchantTransactionId,
                        payableAmount: payableAmount
                    })
                    if (dietSubscription) {
                        let resData = {
                            transactionId: response.data.merchantTransactionId,
                            paymentUrl:
                                response.data.data.instrumentResponse.redirectInfo.url,
                        };
                        return responseWithData(
                            res,
                            200,
                            true,
                            "Payment Created Successfully",
                            resData
                        );
                    }
                    return responseWithoutData(res, 403, false, "Something went Wrong");
                })
                .catch(function (error) {
                    errorLog(error);
                    return responseWithoutData(
                        res,
                        403,
                        false,
                        "Something went Wrong In Phone Pe API"
                    );
                });
        } else {
            return responseWithoutData(res, 404, false, "Diet Plan Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const checkPaymentStatus = async (req, res) => {
    try {
        const phonepay_merchant_id = PHONEPE_MERCHANT_ID;
        const phonepay_transaction_id = req?.body?.transactionId;
        const salt_key = PHONEPE_SALT_KEY;

        const keyIndex = 1;
        const path = `/pg/v1/status/${phonepay_merchant_id}/${phonepay_transaction_id}`;
        const stringToHash = path + salt_key;
        const hash = crypto
            .createHash("sha256")
            .update(stringToHash, "utf-8")
            .digest("hex");
        const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1";
        const response = await axios.get(
            `${prod_URL}/status/${phonepay_merchant_id}/${phonepay_transaction_id}`,
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-VERIFY": `${hash}###${keyIndex}`,
                    "X-MERCHANT-ID": phonepay_merchant_id,
                },
            }
        );
        const responseData = response.data;
        const responseStatus = responseData?.code;

        let dietSubscription = await DietSubscription.findOne({ transactionId: phonepay_transaction_id });
        if (responseStatus == "PAYMENT_SUCCESS") {
            dietSubscription.paymentStatus = "paid";
        } else if (
            responseStatus == "PAYMENT_PENDING" ||
            responseStatus == "TRANSACTION_NOT_FOUND"
        ) {
            dietSubscription.paymentStatus = "unpaid";
        } else if (
            responseStatus == "PAYMENT_CANCELLED" ||
            responseStatus == "PAYMENT_DECLINED" ||
            responseStatus == "PAYMENT_ERROR"
        ) {
            dietSubscription.paymentStatus = "unpaid";
        } else {
            dietSubscription.paymentStatus = "unpaid";
        }
        if ((await dietSubscription.save())) {
            res.status(200).send({
                status: true,
                status: "success",
                message: "Data fetched successfully",
                data: responseData,
            });
        } else {
            errorLog({
                error: "Diet",
                order: phonepay_transaction_id,
            });
        }
    } catch (error) {
        console.error(error);
        res.send({
            status: "error",
            message: error.message,
        });
    }
};


export const userDietConsultation = async (req, res) => {
    try {
        const customer = await authValues(req.headers['authorization'])
        let dietConsultation = await DietConsultation.findOne({isActive:true}).select('_id mrp payableAmount  isPurchase');
        let dietPurchase = await DietSubscription.findOne({ customerId: customer?._id, paymentStatus: "paid" })
        dietConsultation = { ...dietConsultation._doc, isPurchase: dietPurchase != null ? true : false };
        responseWithData(res, 200, true, "Diet Consultation List Get Successfully", {
            dietConsultation,
        });
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
};