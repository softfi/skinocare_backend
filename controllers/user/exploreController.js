import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, getImageSingedUrlById, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import Explore from "../../models/Explore.js";


export const getExplore = async(req, res)=>{
    try {
        let explores = await Explore.find({ isActive:true, isDeleted:false }).select("title upload uploadType description likedBy").sort({createdAt:-1});
        let exploreList = [];
        let user = await authValues(req.headers['authorization']);
        for(let explore of explores){
            exploreList.push({ ...explore._doc, 
                upload: (explore.uploadType == 'image') ? await getImageSingedUrlById(explore.upload) : explore.upload, 
                isLiked: explore.likedBy.includes(user._id), 
                likeCount: explore.likedBy.length 
            });
            // exploreList.splice()
        } 
        responseWithData(res, 200, true, "Explore List Fetch Successfully", exploreList);
    } catch (error) {
        errorLog(error)
        errorResponse(res);
    }
}

export const addOrUpdateLike = async(req, res)=>{
    try {
        let explore = await Explore.findOne({_id:req?.params?.exploreId, isDeleted:false }).select("likedBy");
        if(explore){
            let user = await authValues(req.headers['authorization']);
           if(!explore.likedBy.includes(user._id)){
               explore.likedBy.push(user._id);
            if(await explore.save()){
                responseWithoutData(res, 200, true, "Explore is Liked!");
            }
           }else{
            let index = explore.likedBy.indexOf(user._id);
            if(index > -1) {
            explore.likedBy.splice(index, 1);             
            }             
            if(await explore.save()){
                responseWithoutData(res, 200, true, "Explore is Disliked!");
            }
           }
        }else{
            responseWithoutData(res, 404, false, "Explore Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}
