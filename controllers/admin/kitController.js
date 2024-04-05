import { errorLog } from "../../config/logger.js";
import {
  errorResponse,
  getImageSingedUrlById,
  responseWithData,
  responseWithoutData,
} from "../../helpers/helper.js";
import Kit from "../../models/kit.js";

export const kitList = async (req, res) => {
  try {
    let kits = await Kit.find().populate(['products', 'symtom']);
    let kitList = [];
    for (let kit of kits) {
      kitList.push({ ...kit._doc, image: await getImageSingedUrlById(kit.image) })
    }
    responseWithData(res, 200, true, "Kit List Get Successfully", {
      kitList,
    });
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};
export const addKit = async (req, res) => {
  try {
    let kit = await Kit.create({
      name: req?.body?.name,
      price: req?.body?.price,
      mrp: req?.body?.mrp,
      symtom: req?.body?.symtom,
      image: req?.body?.image,
      type: req?.body?.type,
      products: req?.body?.products,
      instruction: req?.body?.instruction,
      isActive: req.body.isActive,
      validity: req.body.validity,
    });
    if (kit) {
      responseWithoutData(res, 200, true, "Kit Created Successfully");
    } else {
      responseWithoutData(res, 500, false, "Kit Creation Failed.");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};

export const getKitById = async (req, res) => {
  try {
    let kit = await Kit.findOne({ _id: req.params.kitId });
    if (kit) {
      kit = { ...kit._doc, image: (kit?.image) ? await getImageSingedUrlById(kit.image) : ""}
      responseWithData(res, 200, true, "Kit Retrieved Successfully.", kit);
    } else {
      responseWithoutData(res, 404, false, "Kit not found.");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};

export const updateKit = async (req, res) => {
  try {
    let kit = await Kit.findByIdAndUpdate(
      req?.body?.kitId,
      {
        name: req?.body?.name,
        price: req?.body?.price,
        mrp: req?.body?.mrp,
        symtom: req?.body?.symtom,
        type: req?.body?.type,
        image: req?.body?.image,
        products: req?.body?.products,
        instruction: req?.body?.instruction,
        isActive: req?.body?.isActive,
        validity: req?.body?.validity,
      },
      { new: true }
    );
    if (kit) {
      responseWithoutData(res, 200, true, "Kit Update Successfully.");
    } else {
      responseWithoutData(res, 403, false, "Failed to Update Kit");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};

export const deleteKit = async (req, res) => {
  try {
    let kit = await Kit.findOneAndDelete({ _id: req?.params?.kitId });
    if (kit) {
      responseWithoutData(res, 200, true, "Kit Deleted Successfully.");
    } else {
      responseWithoutData(res, 404, false, "Kit Not Found");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};
