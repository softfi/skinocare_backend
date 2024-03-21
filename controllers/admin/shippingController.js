import axios from "axios";
import { errorLog } from "../../config/logger.js";
import { errorResponse, responseWithData } from "../../helpers/helper.js";

export const dispatchForm = async (req, res) => {
    try {
        let response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
            "email": "sanjaymgowda8888@gmail.com",
            "password": "sanjaym@123"
        });
        let token = response.data.token;

        // CALL SHIPROCKET API
        const axios = require('axios');
        // let data = JSON.stringify({
        //     "order_id": "",
        //     "order_date": "",
        //     "pickup_location": "",
        //     "channel_id": "",
        //     "comment": "",
        //     "reseller_name": "",
        //     "company_name": "",
        //     "billing_customer_name": "",
        //     "billing_last_name": "",
        //     "billing_address": "",
        //     "billing_address_2": "",
        //     "billing_isd_code": "",
        //     "billing_city": "",
        //     "billing_pincode": "",
        //     "billing_state": "",
        //     "billing_country": "",
        //     "billing_email": "",
        //     "billing_phone": "",
        //     "billing_alternate_phone": "",
        //     "shipping_is_billing": "",
        //     "shipping_customer_name": "",
        //     "shipping_last_name": "",
        //     "shipping_address": "",
        //     "shipping_address_2": "",
        //     "shipping_city": "",
        //     "shipping_pincode": "",
        //     "shipping_country": "",
        //     "shipping_state": "",
        //     "shipping_email": "",
        //     "shipping_phone": "",
        //     "order_items": [
        //         {
        //             "name": "",
        //             "sku": "",
        //             "units": "",
        //             "selling_price": "",
        //             "discount": "",
        //             "tax": "",
        //             "hsn": ""
        //         }
        //     ],
        //     "payment_method": "",
        //     "shipping_charges": "",
        //     "giftwrap_charges": "",
        //     "transaction_charges": "",
        //     "total_discount": "",
        //     "sub_total": "",
        //     "length": "",    
        //     "breadth": "",
        //     "height": "",
        //     "weight": "",
        //     "ewaybill_no": "",
        //     "customer_gstin": "",
        //     "invoice_number": "",
        //     "order_type": ""
        // });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' +token
  },
            data: data
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                console.log(error);
            });


        responseWithData(res, 200, true, "Logged In Successfully", token);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}