import { errorLog } from "../../config/logger.js";
import {
  authValues,
  errorResponse,
  responseWithData,
  responseWithoutData,
} from "../../helpers/helper.js";
import WalletHistory from "../../models/walletHistory.js";

export const walletHistoryList = async (req, res) => {
  try {
    let walletHistory = await WalletHistory.find();
    responseWithData(res, 200, true, "Wallet List Get Successfully", {
        walletHistory,
    });
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};


export const getWalletHistoryByCustomerId = async (req, res) => {
  try {
    let user = await authValues(req.headers['authorization']);
    let walletHistory = await WalletHistory.find({ customerId: user?._id });
    if (walletHistory) {
      responseWithData(
        res,
        200,
        true,
        "Wallet Retrieved Successfully.",
        walletHistory
      );
    } else {
      responseWithoutData(res, 404, false, "Wallet not found.");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};


