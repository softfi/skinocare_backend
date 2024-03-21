import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, getImageSingedUrlById, responseWithData, responseWithoutData, uploadToS3 } from "../../helpers/helper.js";
import Categroy from "../../models/Categroy.js";
import Upload from "../../models/Upload.js";

export const adminCategoryList = async (req, res) => {
    try {
        let categories = await Categroy.find({ isDeleted: false });
        let categoriesWithImage = [];
        for(let i=0;i<categories.length;i++){
            categoriesWithImage.push({ ...categories[i]._doc , image: await getImageSingedUrlById(categories[i].image)})
        }
        responseWithData(res, 200, true, "Category List get Successfully", categoriesWithImage);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const addCategory = async (req, res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        let type = {};
        if(req?.body?.type != undefined){
            type = {type:req?.body?.type}
        }
        let category = await Categroy.create({
            name: req.body.name,
            image: req.body.imageId,
            addedBy: user._id,
            ...type
        });
        let updatedRelatedId = await Upload.findByIdAndUpdate(req.body.imageId, {
            relatedId: category._id
        })
        if (category && updatedRelatedId) {
            responseWithoutData(res, 200, true, "Category Created successfully");
        } else {
            responseWithoutData(res, 200, false, "Category Creation failed");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const getCategoryById = async (req, res) => {
    try {
        let category = await Categroy.findOne({ _id: req.params.categoryId, isDeleted: false });
        if (category) {
            category = {...category?._doc,image: await getImageSingedUrlById(category?._doc?.image)}
            // Category found
            responseWithData(res, 200, true, "Category Retrieved Successfully.", category);
        } else {
            // Category not found
            responseWithoutData(res, 404, false, "Category Not found.");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const updateCategory = async (req, res) => {
    try {
        let category = await Categroy.findById(req.body.categoryId);
        if (category) {
            if (req.body.imageId) {
                await Upload.findByIdAndUpdate(category.image, {
                    isDeleted: true,
                });

                await Upload.findByIdAndUpdate(req.body.imageId, {
                    relatedId: category._id,
                });
            }
            const updatedCategory = await Categroy.findByIdAndUpdate(category._id, {
                name: req.body.name ? req.body.name : category.name,
                image: req.body.imageId ? req.body.imageId : category.image,
            }, { new: true });
            if (updatedCategory) {
                responseWithoutData(res, 200, true, "Category Updated Successfully");
            } else {
                responseWithoutData(res, 501, false, "Something went wrong while updating the Category")
            }
        }else{
            responseWithoutData(res, 404, false, "Category Not found");
        }

    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const deleteCategory = async (req, res) => {
    try {
        let category = await Categroy.findOne({ _id: req.params.categoryId, isDeleted:false});
        if (category) {
            category.isDeleted = true;
            await Upload.findByIdAndUpdate(category.image,{ isDeleted: true })
            if(await category.save()){
                responseWithoutData(res, 200, true, "Category Deleted Successfully")
            }
        } else{
            responseWithoutData(res, 501, true, "Category Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
} 