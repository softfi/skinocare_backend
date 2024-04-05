import Product from "../../models/Product.js";
import { errorLog } from "../../config/logger.js";
import {
  errorResponse,
  responseWithoutData,
  responseWithData,
  authValues,
  getImageSingedUrlById,
} from "../../helpers/helper.js";
import Upload from "../../models/Upload.js";
import Categroy from "../../models/Categroy.js";

export const adminProductList = async (req, res) => {
  try {
    let products = await Product.find({ isDeleted: false }).sort({
      createdAt: -1,
    });
    let productList = [];
    for (let i = 0; i < products.length; i++) {
      let categories = await Categroy.find({
        _id: { $in: products[i].categoryId },
      }).select("name");
      productList.push({
        ...products[i]._doc,
        thumbnail: await getImageSingedUrlById(products[i].thumbnail),
        categories: categories,
      });
    }
    responseWithData(
      res,
      200,
      true,
      "Product List Fetched Successfully",
      productList
    );
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};

export const addProduct = async (req, res) => {
  try {
    let user = await authValues(req.headers["authorization"]);
    let product = await Product.create({
      name: req.body.name,
      thumbnail: req.body.thumbnail,
      images: req.body.images,
      rating: req.body.rating,
      slug: req.body.slug.trim(),
      price: req.body.price,
      mrp: req.body.mrp,
      isDiscount: req.body.isDiscount,
      discountType: req.body.discountType,
      discount: req.body.discount,
      currentStock: req.body.currentStock,
      refundable: req.body.refundable,
      // shippingCost : req.body.shippingCost,
      gst: req.body.gst,
      ingredients: req.body.ingredients,
      indications: req.body.indications,
      disclaimer: req.body.disclaimer,
      specifictation: req.body.specifictation,
      howToUse: req.body.howToUse,
      howToUseVideo: req.body.howToUseVideo,
      whenToUse: req.body.whenToUse,
      categoryId: req.body.categoryId,
      title: req.body.title,
      description: req.body.description,
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
      addedBy: user._id,
    });
    if (product) {
      responseWithoutData(res, 200, true, "Product Created Successfully");
    } else {
      responseWithoutData(res, 501, true, "Product Creation failed");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};

export const getProductById = async (req, res) => {
  try {
    let product = await Product.findById(req.body.productId);
    if (product) {
      product = {
        ...product?._doc,
        thumbnail: await getImageSingedUrlById(product?._doc?.thumbnail),
      };
      responseWithData(res, 200, true, "Product get Successfully", product);
    } else {
      responseWithoutData(res, 501, false, "Product Not Found");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};

export const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.body.productId);
    product.name = req?.body?.name ? req?.body?.name : product.name;
    product.thumbnail = req?.body?.thumbnail
      ? req?.body?.thumbnail
      : product.thumbnail;
    product.images = req?.body?.images ? req?.body?.images : product.images;
    product.categoryId = req?.body?.categoryId
      ? req?.body?.categoryId
      : product.category;
    product.price = req?.body?.price ? req?.body?.price : product.price;
    product.mrp = req?.body?.mrp ? req?.body?.mrp : product.mrp;
    product.discountType = req?.body?.discountType
      ? req?.body?.discountType
      : product.discountType;
    product.discount = req?.body?.discount
      ? req?.body?.discount
      : product.discount;
    product.rating = req?.body?.rating ? req?.body?.rating : product.rating;
    product.slug = req?.body?.slug.trim()
      ? req?.body?.slug.trim()
      : product.slug.trim();
    product.refundable = req?.body?.refundable
      ? req?.body?.refundable
      : product.refundable;
    product.currentStock = req?.body?.currentStock
      ? req?.body?.currentStock
      : product.currentStock;
    product.gst = req?.body?.gst ? req?.body?.gst : product.gst;
    product.ingredients = req?.body?.ingredients
      ? req?.body?.ingredients
      : product.ingredients;
    product.indications = req?.body?.indications
      ? req?.body?.indications
      : product.indications;
    product.disclaimer = req?.body?.disclaimer
      ? req?.body?.disclaimer
      : product.disclaimer;
    product.specifictation = req?.body?.specifictation
      ? req?.body?.specifictation
      : product.specifictation;
    product.howToUse = req?.body?.howToUse
      ? req?.body?.howToUse
      : product.howToUse;
    product.howToUseVideo = req?.body?.howToUseVideo;
    product.whenToUse = req?.body?.whenToUse
      ? req?.body?.whenToUse
      : product.whenToUse;
    product.title = req?.body?.title ? req?.body?.title : product.title;
    product.description = req?.body?.description
      ? req?.body?.description
      : product.description;
    product.metaTitle = req?.body?.metaTitle
      ? req?.body?.metaTitle
      : product.metaTitle;
    product.metaDescription = req?.body?.metaDescription
      ? req?.body?.metaDescription
      : product.metaDescription;
    product.metaImage = req?.body?.metaImage
      ? req?.body?.metaImage
      : product.metaImage;
    // product.shippingCost    = req?.body?.shippingCost      ? req?.body?.shippingCost    :   product.shippingCost ;

    if (await product.save()) {
      responseWithoutData(res, 200, true, "Product Updated Successfully");
    } else {
      responseWithoutData(res, 501, true, "Product Updation failed");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.body.productId,
      isDeleted: false,
    });
    if (product) {
      product.isDeleted = true;
      /* Image Deletion */
      await Upload.findByIdAndUpdate(product.thumbnail, { isDeleted: true });
      await Upload.updateMany(
        { _id: { $in: product.images } },
        { isDeleted: true }
      );
      if (await product.save()) {
        responseWithoutData(res, 200, true, "Product Deleted Successfully");
      }
    } else {
      responseWithoutData(res, 501, false, "Product Not Found");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};
