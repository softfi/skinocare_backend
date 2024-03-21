import Page from "../../models/Page.js";
import { errorLog } from "../../config/logger.js"
import { authValues, errorResponse, responseWithData, responseWithoutData } from "../../helpers/helper.js"


export const pageList = async (req, res) => {
    try {
        let pageList = await Page.find({ isDeleted: false });
        responseWithData(res, 200, true, "Page List Fetch Successfully", pageList);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const addPage = async (req, res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        let page = await Page.create({
            name: req.body.name,
            content: req.body.content,
            slug: req.body.slug,
            addedBy: user._id
        });
        if (page) {
            responseWithoutData(res, 200, true, "Page Created Successfully");
        } else {
            responseWithoutData(res, 403, false, "Failed to Create Page");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getPageById = async (req, res) => {
    try {
        let page = await Page.findOne({ _id: req.params.pageId, isDeleted: false });
        if (page) {
            responseWithData(res, 200, true, "Page Fetched Successfully", page)
        } else {
            responseWithoutData(res, 404, false, "Page Not Found")
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const updatePage = async (req, res) => {
    try {
        let page = await Page.findOne({ _id: req.body.pageId, isDeleted: false });
        if (page) {
            page.name = req.body.name ?? page.name;
            page.content = req.body.content ?? page.content;
            page.slug = req.body.slug ?? page.slug;
            page.isActive = req.body.isActive ?? page.isActive;
            if (await page.save()) {
                responseWithoutData(res, 200, true, "Page Updated Successfully");
            } else {
                responseWithoutData(res, 403, false, "Failed to Update Page");
            }
        } else {
            responseWithoutData(res, 404, false, "Page Not Found")
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const deletePage = async (req, res) => {
    try {
        let page = await Page.findOne({ _id: req.params.pageId, isDeleted: false });
        if (page) {
            page.isDeleted = true;
            if (await page.save()) {
                responseWithoutData(res, 200, true, "Page Deleted Successfully");
            } else {
                responseWithoutData(res, 403, false, "Failed to Delete Page");
            }
        } else {
            responseWithoutData(res, 404, false, "Page Not Found")
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const isPageSlugUnique = async (slugToCheck) => {
    try {
        const existingPage = await Page.findOne({ slug: slugToCheck, isDeleted:false });
        return !existingPage;
    } catch (error) {
        errorLog(error);
    }
}


export const  isPageSlugUniqueUpdate = async(pageId,slugToCheck)=>{
    try {
      const existingPage = await Page.findOne({ _id : { $ne : pageId },  slug: slugToCheck , isDeleted:false });
      return !existingPage;
    } catch (error) {
        errorLog(error);
    }
  }

