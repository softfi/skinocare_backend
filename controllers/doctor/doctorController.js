
import User from "../../models/User.js";
import { authValues, errorResponse, getImageSingedUrlById, responseWithData, responseWithoutData, } from "../../helpers/helper.js";
import { errorLog } from "../../config/logger.js"
import Kit from "../../models/kit.js";
import Prescription from "../../models/Prescription.js";
import kit from "../../models/kit.js";
import Plan from "../../models/Plan.js";
import Product from "../../models/Product.js";
import Conversation from "../../models/Conversation.js";

//Get List All Users
export const getListAllUsers = async (req, res) => {
    try {

        let doctorId = await authValues(req?.headers['authorization']);
        const doctor = await User.findOne({ _id: doctorId._id });

        if (doctor) {
            // Doctor found, now get all users associated with this doctor
            let users = await User.find({
                $or: [
                    { skinDoctor: doctor.id },
                    { hairDoctor: doctor._id }
                ],
                type: 'customer',
                isDeleted: false
            });
            return responseWithData(res, 200, true, "All Patients Fetch Successfully", users);

        } else {
            // Doctor not found
            return responseWithData(res, 404, false, "Doctor Not Found");
        }

    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }

}


// Get All Kits

export const getAllKitsDoctor = async (req, res) => {
    try {

        let getAllKits = await Kit.find();

        getAllKits = await Promise.all(getAllKits.map(async (kit) => {
            let tempKit = JSON.parse(JSON.stringify(kit));
            let tempUrl = await getImageSingedUrlById(tempKit.image)
            tempKit.imageUrl = tempUrl;

            tempKit.instruction = await Promise.all(tempKit.instruction.map(async (item) => {
                if (item && item.image) {
                    let tempIns = JSON.parse(JSON.stringify(item));
                    tempIns.imageUrl = await getImageSingedUrlById(tempIns.image);
                    return tempIns;
                }
                return item;
            }));

            return tempKit;
        }));

        if (!getAllKits) {
            return responseWithoutData(res, 404, false, "Kits not found.");
        }
        responseWithData(res, 200, true, "Doctor All Kits Fetch Successfully", getAllKits);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

// Get Kit by Kit ID
export const getKitByKitId = async (req, res) => {
    try {
        let plans = await Plan.find({ kitId: req?.body?.kitId, isDeleted: false });
        if (plans.length > 0) {
            let planList = [];
            for (let plan of plans) {
                planList.push({ ...plan._doc, image: await getImageSingedUrlById(plan?.image) });
            }
            return responseWithData(res, 200, true, "Kit Plan get Successfully!!", planList);
        } else {
            return responseWithoutData(res, 201, false, "No Record Found!!");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

// Dashboard

export const doctorDashboard = async (req, res) => {
    try {

        const getAllProducts = await Product.find({ isDeleted: false });
        const getAllKits = await Kit.find();
        ;
        let doctorId = await authValues(req.headers['authorization']);


        const doctor = await User.findOne({ _id: doctorId._id });

        if (doctor) {
            // Doctor found, now get all users associated with this doctor
            let users = await User.find({
                $or: [
                    { skinDoctor: doctor._id },
                    { hairDoctor: doctor._id }
                ],
                type: 'customer',
                isDeleted: false
            });

            // Construct response object with all data
            let responseData = {
                patientCount: users.length,
                productCount: getAllProducts.length,
                kitCount: getAllKits.length,
                // patients: users,
                // products: getAllProducts,
                // kits: getAllKits
            };

            responseWithData(res, 200, true, "Data Retrieved Successfully", responseData);
        } else {
            // Doctor not found
            return responseWithoutData(res, 404, false, "Doctor Not found.");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

// *************************** PRESCRIPTION API'S START **************************************************************************************************

// Add Prescription 
export const addPrescription = async (req, res) => {
    try {

        let doctor = await authValues(req.headers['authorization']);
        let createprescription = await Prescription.create({
            title: req.body.title,
            description: req.body.description,
            addedBy: doctor._id,
        });
        if (createprescription) {

            return responseWithData(res, 200, true, "Prescription Created successfully", createprescription);
        }

        responseWithoutData(res, 200, false, "Prescription Creation failed");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }

}

// Get Prescription By Id
export const getPrescriptionById = async (req, res) => {
    try {

        let doctor = await authValues(req.headers['authorization']);
        let getPrescription = await Prescription.findOne({ _id: req.params.prescriptionId, addedBy: doctor._id, isDeleted: false });
        if (getPrescription) {

            return responseWithData(res, 200, true, "Prescription Retrieved Successfully.", getPrescription);
        } else {
            // Category not found
            return responseWithoutData(res, 404, false, "Prescription Not found.");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

// Get Prescription List
export const getPrescriptionList = async (req, res) => {
    try {


        let doctor = await authValues(req.headers['authorization']);
        let getPrescription = await Prescription.find({ addedBy: doctor._id, isDeleted: false });
        if (getPrescription) {

            return responseWithData(res, 200, true, "Prescription List Retrieved Successfully.", getPrescription);
        } else {
            // Category not found
            return responseWithoutData(res, 404, false, "Prescription Not found.");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

// Update Prescription
export const updatePrescription = async (req, res) => {
    try {

        let doctor = await authValues(req.headers['authorization']);
        let prescription = await Prescription.findById(req.body.prescriptionId, { addedBy: doctor._id });
        if (prescription) {
            const updatedPrescription = await Prescription.findByIdAndUpdate(prescription._id, {
                title: req.body.title ? req.body.title : category.title,
                description: req.body.description ? req.body.description : category.description,

            }, { new: true });
            if (updatedPrescription) {
                responseWithData(res, 200, true, "Prescription Updated Successfully", updatedPrescription);
            } else {
                responseWithoutData(res, 501, false, "Something went wrong while updating the Prescription")
            }
        } else {
            responseWithoutData(res, 404, false, "Prescription Not found");
        }

    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

// Delete Prescription
export const deletePrescription = async (req, res) => {
    try {

        let doctor = await authValues(req.headers['authorization']);
        let prescription = await Prescription.findOne({ _id: req.params.prescriptionId, addedBy: doctor._id, isDeleted: false });
        if (prescription) {
            prescription.isDeleted = true;
            if (await prescription.save()) {
                responseWithoutData(res, 200, true, "Prescription Deleted Successfully")
            }
        } else {
            responseWithoutData(res, 501, true, "Prescription Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

// ****************************** PRESCRIPTION API'S END *******************************************************************************************************

//***************************** SOCKET IO API'S START *************************************************************************************** */

// GET CHAT DETAILS
export const getChatDetails = async (req, res) => {
    try {
        let doctor = await authValues(req.headers['authorization']);
        const conversation = await Conversation.findOne({ $or:[
            {participants: [req?.body?.id,doctor?._id]},
            {participants: [doctor?._id,req?.body?.id]}
        ] }).populate('messages');

        if (conversation) {
            let messages = [];
            if(conversation?.messages){
                for (let message of conversation?.messages) {
                    let extraData = '';
                    if(message?.type == 'prescription'){
                        extraData = await Prescription.findById(message?.message).select("title description");
                    } else if (message?.type == 'regimen') {
                        extraData = await kit.findById(message?.message).select("name image");
                        extraData = {...extraData?._doc, image : await getImageSingedUrlById(extraData?.image)};
                    } else if (message?.type == 'product') {
                        extraData = await Product.findById(message?.message).select("name image slug");
                        extraData = {...extraData?._doc, image : await getImageSingedUrlById(extraData?.image)};
                    } else if (message?.type == 'image') {
                        extraData = { image : await getImageSingedUrlById(message?.message)};
                    }
                    messages.push({...message?._doc,extraData});
                }
            }
            return responseWithData(res, 200, true, "Conversation Details Fetched successfully", {...conversation?._doc, messages: messages});
        } else {
            return responseWithoutData(res, 200, false, "Conversation details not found for the specified participants");
        }

    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }

}

// CHAT COMPLETE API
export const completeChat = async (req, res) => {
    try {
        const { conversationId } = req.body;

        // Update the conversation status to indicate completion
        const chat = await Conversation.findByIdAndUpdate(conversationId, { status: 'complete' }, { new: true });
        if (chat) {
            return responseWithData(res, 200, true, "Chat marked as complete", chat);
        }
        return responseWithoutData(res, 200, false, 'Failed to mark chat as complete');

    } catch (error) {
        errorLog(error);
        errorResponse(res);

    }
};

export const getKitDetails = async (req,res) => {
    try {
        const kitData = await kit.findOne({_id:req?.body?.id})
        // .populate("symtom products");
        .populate({ path: 'symtom', select: 'name type' })
        .populate({ path: 'products', select: 'name thumbnail slug price mrp description' })
        if (kitData) {
            let products = [];
            for (let product of kitData?.products) {
                products.push({...product?._doc, thumbnail: (product?.thumbnail) ? await getImageSingedUrlById(product?.thumbnail) : ""});
            } 
            delete kitData?._doc?.instruction;
            return responseWithData(res, 200, true, "Kit Details Find Successfully!!", {...kitData?._doc,image: (kitData?.image) ? await getImageSingedUrlById(kitData?.image) : "",products});
        }
        return responseWithoutData(res, 201, false, 'No Record Found!!');
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}
