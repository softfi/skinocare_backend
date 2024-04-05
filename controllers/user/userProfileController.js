import { uploadsPath } from "../../config/config.js";
import { authValues, base64toimageAndUploadToServer, callImageAnalysisApi, callImageAnalysisApiAdvanced, callImageAnalysisApiNew, customizeAnalysisReport, darkCircleDraw, drawPolygonOnImage, errorResponse, generateHairKit, generateSkinKit, getCustomFieldByCustomerId, getImageSingedUrlById, getImageWithAcneSpot, responseWithData, responseWithoutData, skinAnalysisRapidData, skinKitGenerateWithApi, uploadImageSkinAnalysis, uploadToS3 } from "../../helpers/helper.js";
import fs from 'fs';
import Upload from "../../models/Upload.js";
import SkinAnalysis from "../../models/SkinAnalysis.js";
import { errorLog } from "../../config/logger.js";
import SkinAnalysisNew from "../../models/SkinAnalysisNew.js";
import ShippingAddress from "../../models/ShippingAddress.js";
import Order from "../../models/Order.js";
import User from "../../models/User.js";

 export const userDetails = async (req,res)=>{
  try {
    let user = await User.findById(req.params.customerId)
    const address = await ShippingAddress.find({customerId:user?._id,isDefault: false  }).select('name phone alternativePhone pincode district state country area locatity landmark  houseNo isDefault ')
    const shippingAddress = await ShippingAddress.find({customerId:user?._id,isDefault: true }).select('name phone alternativePhone pincode district state country area locatity landmark  houseNo isDefault ')
  const orders = await Order.find({customerId:user?._id})
  const orderCount  = await Order.find({customerId:user?._id}).count();
  const totalOrderValue = await Order.aggregate([
    { $match: { customerId: user?._id } },
    { $group: { _id: null, totalValue: { $sum: "$grandTotal" } } }
  ]);
  return responseWithData(res, 200, true, "User Profile Get Successfully!!", {userDetails:{name:user?.name, email:user?.email,mobile:user?.mobile},address:address, shippingAddress:shippingAddress,orderDetails:orders, orderCount:orderCount,totalOrderValue:totalOrderValue });
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
 }


export const imageProcessWithLiveData = async (req,res) => {
  try {
    let user = await authValues(req.headers['authorization']);
    if (!req.file || Object.keys(req.file).length === 0) {
      return responseWithoutData(res,201,false,"No image has been selected!");
    }
    req.body.type = 'ImageAnalysis'; 
    // let userId = '64fb0bd2c140c24a57962cb2';
    let userId = user?._id?.toString();
    const uploadedFile = req?.file; // 'file' is the name attribute in the form
    const getExtansion = uploadedFile?.originalname?.split(".");
    const fileName = `image-analysis-${(new Date()).getTime()}.${getExtansion?.[(getExtansion.length-1)]}`;
    let filePath = await uploadsPath(req?.body?.type);
    fs.writeFileSync(`uploads/skin_analysis/${fileName}`, uploadedFile.buffer);
    await uploadToS3(`${fileName}`, filePath, uploadedFile.buffer);
    let uploadImage = await Upload.create({
      fileName: fileName,
      filePath: filePath,
      relatedWith: req.body.type,
      addedBy: userId,
    });
    if(uploadImage){
      const uploadedImagePath = `./uploads/skin_analysis/${fileName}`;
      const uploadedImageURL = await getImageSingedUrlById(uploadImage?._id);
    //   let apiResponse = await callImageAnalysisApi(uploadedImagePath); 
      let apiResponse = fs.readFileSync('./testFace.json','utf8'); 
      apiResponse = JSON.parse(apiResponse);
      if(apiResponse?.status == false) {
        return responseWithoutData(res,201,false,"Something Went Wrong,Please Try Again Later!");
      }
      
      let outputImagePath = './uploads/analysis-result/';
      /************************* ACNE PIMPLE START ***********************/

      let acnePimpleList = (apiResponse?.result?.face_list?.[0]?.acnespotmole?.acne_list != undefined ) ? apiResponse?.result?.face_list?.[0]?.acnespotmole?.acne_list : [];
      let acneImageId = null;
      if(acnePimpleList.length > 0) {
        await getImageWithAcneSpot(uploadedImageURL,acnePimpleList,`${outputImagePath}pimple.png`);
        acneImageId = await uploadImageSkinAnalysis(`${outputImagePath}pimple.png`,userId);
      }

      /************************* ACNE PIMPLE END ***********************/

      /************************* BLACKHEAD PIMPLE START ***********************/

      let acneblackheadList = (apiResponse?.result?.face_list?.[0]?.blackheadpore?.circles?.[0]?.blackhead != undefined ) ? apiResponse?.result?.face_list?.[0]?.blackheadpore?.circles?.[0]?.blackhead : [];
      let blackheadImageId = null;
      if(acneblackheadList.length > 0) {
        await getImageWithAcneSpot(uploadedImageURL,acneblackheadList,`${outputImagePath}blackhead.png`);
        blackheadImageId = await uploadImageSkinAnalysis(`${outputImagePath}blackhead.png`,userId);
      }

      /************************* BLACKHEAD PIMPLE END ***********************/

      /************************* BLACKHEADPORE PIMPLE START ***********************/

      let acneblackheadporeList = (apiResponse?.result?.face_list?.[0]?.blackheadpore?.circles?.[1]?.pore != undefined ) ? apiResponse?.result?.face_list?.[0]?.blackheadpore?.circles?.[1]?.pore : [];
      let blackheadporeImageId = null;
      if(acneblackheadporeList.length > 0) {
        await getImageWithAcneSpot(uploadedImageURL,acneblackheadporeList,`${outputImagePath}blackheadpore.png`);
        blackheadporeImageId = await uploadImageSkinAnalysis(`${outputImagePath}blackheadpore.png`,userId);
      }

      /************************* BLACKHEADPORE PIMPLE END ***********************/

      await SkinAnalysis.create({
        customerId              : userId,
        frontFaceImage          : uploadImage?._id,
        resltPimpleImage        : (acneImageId) ? acneImageId?._id : null,
        resltblackheadImage     : (blackheadImageId) ? blackheadImageId?._id : null,
        resltblackheadPoreImage : (blackheadporeImageId) ? blackheadporeImageId?._id : null,
        apiResponse             : apiResponse,
        status                  : true,
      });
      // let skinAnalysisReportData = {
      //   uploadedImageFront     :      uploadedImageURL,
      //   uploadedImageLeft      :      null,
      //   uploadedImageRight     :      null,
      //   acneImage              :      (acneImageId) ? await getImageSingedUrlById(acneImageId?._id) : null,
      //   blackheadImage         :      (blackheadImageId) ? await getImageSingedUrlById(blackheadImageId?._id) : null,
      //   blackheadporeImage     :      (blackheadporeImageId) ? await getImageSingedUrlById(blackheadporeImageId?._id) : null,
      // };
      let skinAnalysisReportData = {
        uploadedImageFront     :      uploadedImageURL,
        uploadedImageLeft      :      null,
        uploadedImageRight     :      null,
        analysisResult         :      []
      };
      if(acneImageId){
        skinAnalysisReportData?.analysisResult?.push({problem:'Acne',image:await getImageSingedUrlById(acneImageId?._id)});
      }
      if(blackheadImageId){
        skinAnalysisReportData?.analysisResult?.push({problem:'Acne',image:await getImageSingedUrlById(blackheadImageId?._id)});
      }
      if(blackheadporeImageId){
        skinAnalysisReportData?.analysisResult?.push({problem:'Acne',image:await getImageSingedUrlById(blackheadporeImageId?._id)});
      }
      return responseWithData(res, 200, true, "Image Analysis Report Get Successfully!!", { skinAnalysisReportData });
    }else{
      return responseWithoutData(res, 201, false, "Something Went Wrong!!");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
}


export const imageProcessNew = async (req,res) => {
  try {
    let user = await authValues(req.headers['authorization']);
    if (!req.file || Object.keys(req.file).length === 0) {
      return responseWithoutData(res,201,false,"No image has been selected!");
    }
    // let userId = '64fb0bd2c140c24a57962cb2';
    let userId = user?._id?.toString();
    const uploadedFile = req?.file; // 'file' is the name attribute in the form
    const getExtansion = uploadedFile?.originalname?.split(".");
    const fileName = `image-analysis-${(new Date()).getTime()}.${getExtansion?.[(getExtansion.length-1)]}`;
    let filePath = await uploadsPath(req?.body?.type);
    fs.writeFileSync(`uploads/skin_analysis/${fileName}`, uploadedFile.buffer);
    await uploadToS3(`${fileName}`, filePath, uploadedFile.buffer);
    let uploadImage = await Upload.create({
      fileName: fileName,
      filePath: filePath,
      relatedWith: req.body.type,
      addedBy: userId,
    });
    if(uploadImage){
      const uploadedImagePath = `./uploads/skin_analysis/${fileName}`;
      let apiResponse = await callImageAnalysisApiNew(uploadedImagePath);
      // let apiResponse = fs.readFileSync('./testFace1.json','utf8'); 
      // apiResponse = JSON.parse(apiResponse);
      let imagePath = './uploads/skin_report/';
      let analysisReportResult = {};
      analysisReportResult.brown_area = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.brown_area,imagePath+'brown_area.png',userId);
      analysisReportResult.red_area = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.red_area,imagePath+'red_area.png',userId);
      analysisReportResult.roi_outline_map = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.roi_outline_map,imagePath+'roi_outline_map.png',userId);
      analysisReportResult.rough_area = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.rough_area,imagePath+'rough_area.png',userId);
      analysisReportResult.texture_enhanced_blackheads = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.texture_enhanced_blackheads,imagePath+'texture_enhanced_blackheads.png',userId);
      analysisReportResult.texture_enhanced_bw = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.texture_enhanced_bw,imagePath+'texture_enhanced_bw.png',userId);
      analysisReportResult.texture_enhanced_lines = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.texture_enhanced_lines,imagePath+'texture_enhanced_lines.png',userId);
      analysisReportResult.texture_enhanced_oily_area = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.texture_enhanced_oily_area,imagePath+'texture_enhanced_oily_area.png',userId);
      analysisReportResult.texture_enhanced_pores = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.texture_enhanced_pores,imagePath+'texture_enhanced_pores.png',userId);
      analysisReportResult.water_area = await base64toimageAndUploadToServer(apiResponse?.result?.face_maps?.water_area,imagePath+'water_area.png',userId);
      analysisReportResult.customerId = userId;
      let saveResult = await SkinAnalysisNew.create({
        ...analysisReportResult,
        status:true,
        apiResponse:apiResponse,
        frontFaceImage: uploadImage?._id
      });
      return responseWithData(res, 200, true, "Image Analysis Report Get Successfully!!", { skinAnalysisReportData:await customizeAnalysisReport(saveResult) });
    }else{
      return responseWithoutData(res, 201, false, "Something Went Wrong!!");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
}

export const analysisReport = async (req,res) => {
  try {
    let user = await authValues(req.headers['authorization']);
    let totalCount = await SkinAnalysis.find({customerId:user?._id,deletedAt:{$ne:true}}).count();
    let analysisReport = await SkinAnalysis.find({customerId:user?._id,deletedAt:{$ne:true}}).sort({createdAt:-1});
    let analysisReportList = [];
    for(let index in analysisReport){
      let report = analysisReport?.[index];
      // analysisReportList.push({...report._doc,skinAnalysisReportData : await customizeAnalysisReport(report)});
      analysisReportList.push(await skinAnalysisRapidData(report));
    } 
    if(analysisReport.length > 0){
      return responseWithData(res, 200, true, "Analysis Report Found Successfully!!",{list:analysisReportList,totalCount:totalCount});
    } else {
      return responseWithoutData(res, 201, false, "Record Not Found!!");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
}

export const analysisReportDelete = async (req,res) => {
  try {
    let customer = await authValues(req.headers["authorization"]);
    let isAnalysisExist = await SkinAnalysis.findOne({ customerId: customer?._id, _id: req?.body?.analysisId });
    if(isAnalysisExist) {
      await SkinAnalysis.findByIdAndUpdate(isAnalysisExist?._id,{$set:{deletedAt:true}});
      return responseWithoutData(res,200,true,"Analysis Report has been deleted Successfully!!");
    } else {
      return responseWithoutData(res,201,false,"Invalid Analysis Id!!");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
}

export const skinAnalysisRapidApi = async (req,res) => {
  try {
    let user = await authValues(req.headers['authorization']);
    if (!req.file || Object.keys(req.file).length === 0) {
      return responseWithoutData(res,201,false,"No image has been selected!");
    }
    req.body.type = 'ImageAnalysis'; 
    // let userId = '64fb0bd2c140c24a57962cb2';
    let userId = user?._id?.toString();
    const uploadedFile = req?.file; // 'file' is the name attribute in the form
    const getExtansion = uploadedFile?.originalname?.split(".");
    const fileName = `image-analysis-${(new Date()).getTime()}.${getExtansion?.[(getExtansion.length-1)]}`;
    let filePath = await uploadsPath(req?.body?.type);
    fs.writeFileSync(`uploads/skin_analysis/${fileName}`, uploadedFile.buffer);
    await uploadToS3(`${fileName}`, filePath, uploadedFile.buffer);
    let uploadImage = await Upload.create({
      fileName: fileName,
      filePath: filePath,
      relatedWith: req.body.type,
      addedBy: userId,
    });
    console.log(uploadImage,"uploaded Image")
    if(uploadImage){
      const uploadedImagePath = `./uploads/skin_analysis/${fileName}`;
      const uploadedImageURL = await getImageSingedUrlById(uploadImage?._id);
      let apiResponse = await callImageAnalysisApi(uploadedImagePath);  
      // let apiResponse = fs.readFileSync('./testFace.json','utf8'); 
      // apiResponse = JSON.parse(apiResponse);
      let apiResponseAdvanced = await callImageAnalysisApiAdvanced(uploadedImagePath);  
      // let apiResponseAdvanced = fs.readFileSync('./testFaceAdvanced.json','utf8'); 
      // apiResponseAdvanced = JSON.parse(apiResponseAdvanced);
      if(apiResponse?.status == false) {
        // return responseWithoutData(res,201,false,"Something Went Wrong,Please Try Again Later!");
        console.log(apiResponse)
        return responseWithData(res, 200, true, "Image Analysis Report Get Successfully!!", { apiResponse });
      }
      
      let outputImagePath = './uploads/analysis-result/';
      /************************ ACNE PIMPLE START **********************/

      let acnePimpleList = (apiResponse?.result?.face_list?.[0]?.acnespotmole?.acne_list != undefined ) ? apiResponse?.result?.face_list?.[0]?.acnespotmole?.acne_list : [];
      let acneImageId = null;
      if(acnePimpleList.length > 0) {
        await getImageWithAcneSpot(uploadedImageURL,acnePimpleList,`${outputImagePath}pimple.png`,6);
        acneImageId = await uploadImageSkinAnalysis(`${outputImagePath}pimple.png`,userId);
      }

      /************************ ACNE PIMPLE END **********************/

      /************************ BLACKHEAD START **********************/

      let acneblackheadList = (apiResponse?.result?.face_list?.[0]?.blackheadpore?.circles?.[0]?.blackhead != undefined ) ? apiResponse?.result?.face_list?.[0]?.blackheadpore?.circles?.[0]?.blackhead : [];
      let blackheadImageId = null;
      if(acneblackheadList.length > 0) {
        await getImageWithAcneSpot(uploadedImageURL,acneblackheadList,`${outputImagePath}blackhead.png`,6);
        blackheadImageId = await uploadImageSkinAnalysis(`${outputImagePath}blackhead.png`,userId);
      }

      /************************ BLACKHEAD END **********************/

      /************************ BLACKHEADPORE START **********************/

      let acneblackheadporeList = (apiResponse?.result?.face_list?.[0]?.blackheadpore?.circles?.[1]?.pore != undefined ) ? apiResponse?.result?.face_list?.[0]?.blackheadpore?.circles?.[1]?.pore : [];
      let blackheadporeImageId = null;
      if(acneblackheadporeList.length > 0) {
        await getImageWithAcneSpot(uploadedImageURL,acneblackheadporeList,`${outputImagePath}blackheadpore.png`,2);
        // await drawPolygonOnImage(uploadedImagePath,`${outputImagePath}blackheadpore.png`,acneblackheadporeList)
        blackheadporeImageId = await uploadImageSkinAnalysis(`${outputImagePath}blackheadpore.png`,userId);
      }

      /************************ BLACKHEADPORE END **********************/

      /************************ WRINKLES START **********************/

      let wrinkleList = (apiResponse?.result?.face_list?.[0]?.wrinkle?.wrinkle_data != undefined ) ? apiResponse?.result?.face_list?.[0]?.wrinkle?.wrinkle_data : [];
      let wrinkleImageId = null;
      if(wrinkleList.length > 0) {
        // await getImageWithAcneSpot(uploadedImageURL,acneblackheadporeList,`${outputImagePath}blackheadpore.png`);
        await drawPolygonOnImage(uploadedImagePath,`${outputImagePath}wrinkle.png`,wrinkleList);
        wrinkleImageId = await uploadImageSkinAnalysis(`${outputImagePath}wrinkle.png`,userId);
      }

      /************************ WRINKLES PIMPLE END **********************/

      /************************ WRINKLES START **********************/

      let darkCircleLeft = (apiResponse?.result?.face_list?.[0]?.eyesattr?.dark_circle_left != undefined ) ? apiResponse?.result?.face_list?.[0]?.eyesattr?.dark_circle_left : [];
      let darkCircleRight = (apiResponse?.result?.face_list?.[0]?.eyesattr?.dark_circle_right != undefined ) ? apiResponse?.result?.face_list?.[0]?.eyesattr?.dark_circle_right : [];
      let darkCircleImageId = null;
      if(wrinkleList.length > 0) {
        // await getImageWithAcneSpot(uploadedImageURL,acneblackheadporeList,`${outputImagePath}blackheadpore.png`);
        await drawPolygonOnImage(uploadedImagePath,`${outputImagePath}darkCircle.png`,darkCircleLeft);
        await drawPolygonOnImage(`${outputImagePath}darkCircle.png`,`${outputImagePath}darkCircle.png`,darkCircleRight);
        darkCircleImageId = await uploadImageSkinAnalysis(`${outputImagePath}darkCircle.png`,userId);
      }

      /************************ WRINKLES  END **********************/

      /************************ DARK SPOT START **********************/

      let darkSpotList = (apiResponseAdvanced?.result?.skin_spot?.rectangle != undefined ) ? apiResponseAdvanced?.result?.skin_spot?.rectangle : [];
      let darkSpotImageId = null;
      if(darkSpotList.length > 0) {
        await darkCircleDraw(darkSpotList,`${outputImagePath}dark_spot.png`,userId,uploadedImagePath);
        darkSpotImageId = await uploadImageSkinAnalysis(`${outputImagePath}dark_spot.png`,userId);
      }

      /************************ DARK SPOT  END **********************/

      /************************ EXTRA IMAGE START **********************/

      let srcImage = await base64toimageAndUploadToServer(apiResponse?.result?.face_list?.[0]?.skinface?.skin_health_check_images?.src_pic,outputImagePath+'srcImage.png',userId);
      let grayImage = await base64toimageAndUploadToServer(apiResponse?.result?.face_list?.[0]?.skinface?.skin_health_check_images?.gray_pic,outputImagePath+'grayImage.png',userId);
      let brownImage = await base64toimageAndUploadToServer(apiResponse?.result?.face_list?.[0]?.skinface?.skin_health_check_images?.brown_pic,outputImagePath+'brownImage.png',userId);
      let redImage = await base64toimageAndUploadToServer(apiResponse?.result?.face_list?.[0]?.skinface?.skin_health_check_images?.red_pic,outputImagePath+'redImage.png',userId);

      /************************ EXTRA IMAGE END **********************/

      let skinAnalysisData = await SkinAnalysis.create({
        customerId              : userId,
        frontFaceImage          : uploadImage?._id,
        resltPimpleImage        : (acneImageId) ? acneImageId?._id : null,
        resltblackheadImage     : (blackheadImageId) ? blackheadImageId?._id : null,
        resltblackheadPoreImage : (blackheadporeImageId) ? blackheadporeImageId?._id : null,
        resltwrinkleImage       : (wrinkleImageId) ? wrinkleImageId?._id : null,
        reslteyesattrImage      : (darkCircleImageId) ? darkCircleImageId?._id : null,
        resltdarkSpotImage      : (darkSpotImageId) ? darkSpotImageId?._id : null,
        srcImage                : (srcImage) ? srcImage : null,
        grayImage               : (grayImage) ? grayImage : null,
        brownImage              : (brownImage) ? brownImage : null,
        redImage                : (redImage) ? redImage : null,
        apiResponse             : apiResponse,
        apiResponseAdvanced     : apiResponseAdvanced,
        status                  : true,
      });
      let skinAnalysisReportData = await skinAnalysisRapidData(skinAnalysisData);
      return responseWithData(res, 200, true, "Image Analysis Report Get Successfully!!", { skinAnalysisReportData });
    }else{
      return responseWithoutData(res, 201, false, "Something Went Wrong!!");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
}

export const generateKit = async (req,res) => {
  try {
    let customer = await authValues(req.headers['authorization']);
    const {type,problem} = req?.body;
    let generatedKit = {customerData:customer};
    if(type == 'hair') {
      let hairKit = await generateHairKit(customer?._id,problem);
      generatedKit = {...generatedKit,kit:hairKit};
    } else if(type == 'skin') {
      if(problem){
        let skinKit = await generateSkinKit(customer?._id,problem);
        generatedKit = {...generatedKit,kit:skinKit};
      } else {
        let analysisReport = await SkinAnalysis.findOne({ customerId: customer?._id }).sort({createdAt:-1});
        let kitGenerateWithApi = await skinKitGenerateWithApi(analysisReport?.apiResponse,analysisReport?.apiResponseAdvanced,customer?._id);
        generatedKit = {...generatedKit,kit:kitGenerateWithApi};
      }
    }
    return responseWithData(res,200,true,`Congratulations! Your Kit for ${type} has been generated Successfully!!`,generatedKit);
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
}
 

export const updateDeviceId = async (req,res) => {
  try {
    let customer = await authValues(req.headers['authorization']);
    await User.findByIdAndUpdate(customer?._id,{$set:{deviceId:req?.body?.deviceId}});
    return responseWithoutData(res,200,true,"Device Key has been Updated Successfully!!");
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
}

export const otpToCallStatus = async (req,res) => {
  try {
    let customer = await authValues(req.headers['authorization']);
    let {type,concernType,status} = req?.body;
    if(type == "set") {
      if (status == true || status == false) {
        await User.findByIdAndUpdate(customer?._id,{$set:{[`${concernType}OptCall`]:status}});
        return responseWithData(res,200,true,"Otp to Call From Doctor save successfully!!",{})
      }else {
        return responseWithoutData(res,500,false,"Status field is required!!");
      }
    } else {
      let getoptCallStatus = await getCustomFieldByCustomerId(customer?._id,[`${concernType}OptCall`]);
      return responseWithData(res,200,true,"Otp to Call From Doctor get Successfully",{status:(getoptCallStatus == true) ? true : false})
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
}
