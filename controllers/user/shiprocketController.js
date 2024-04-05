import { errorLog } from "../../config/logger.js";
import { errorResponse, shiprocketAuthToken } from "../../helpers/helper.js";
import axios from "axios";
import User from "../../models/User.js";
import ShippingAddress from "../../models/ShippingAddress.js";

export const addShiprocketOrder = async (order) => {
  try {
    let token = await shiprocketAuthToken();
    let customer = await User.findById(order.customerId);
    let shippingAddress = await ShippingAddress.findById(
      order.shippingAddressId
    );
    let order_items = [];
    for (let product of order.orderDetails) {
      order_items.push({
        name: product?.name,
        sku: Math.floor(1000 + Math.random() * 9000),
        units: product?.quantity,
        selling_price: product?.price,
        discount: 0,
        tax: product?.gstCost,
        hsn: 0,
      });
    }
    let data = {
      order_id: order?.orderNo, //
      order_date: order?.createdAt.toISOString(), // Dynamic Order Date
      pickup_location: "Virat_Nagar_SkinOcare", // Later Dynamic
      channel_id: "4454125",
      comment: "",
      reseller_name: "", // Static
      company_name: "", // Static
      billing_customer_name: shippingAddress?.name, // Dynamic Customer Name
      billing_last_name: "",
      billing_address:
        shippingAddress?.houseNo +
        shippingAddress?.locatity +
        shippingAddress?.area, // Customer Details
      billing_address_2: "",
      billing_isd_code: "",
      billing_city: shippingAddress?.district, // Customer Details
      billing_pincode: shippingAddress?.pincode, // Customer Details
      billing_state: shippingAddress?.state, // Customer Details
      billing_country: "India", // Customer Details
      billing_email: customer?.email,
      billing_phone: shippingAddress?.phone, // Customer Details
      billing_alternate_phone: shippingAddress?.alternativePhone,
      shipping_is_billing: true,
      shipping_customer_name: shippingAddress?.name, // Customer Details
      shipping_last_name: "",
      shipping_address: shippingAddress?.houseNo,
      shipping_address_2: "",
      shipping_city: shippingAddress?.district,
      shipping_pincode: shippingAddress?.pincode,
      shipping_country: "",
      shipping_state: shippingAddress?.state,
      shipping_email: customer?.email,
      shipping_phone: shippingAddress?.phone,
      order_items: order_items,
      payment_method: order?.paymentMethod == "online" ? "Prepaid" : "Cod",
      shipping_charges: order?.shippingCost,
      giftwrap_charges: "",
      transaction_charges: "",
      total_discount: "",
      sub_total: order?.subTotal,
      length: "6",
      breadth: "4",
      height: "2",
      weight: "0.5",
      ewaybill_no: "",
      customer_gstin: "",
      invoice_number: order?.orderNo,
      order_type: "",
    };

    return new Promise((resolve, reject) => {
      axios
        .post(
          "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
          data,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          }
        )
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          errorLog(error);
          reject(error);
        });
    });
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};
