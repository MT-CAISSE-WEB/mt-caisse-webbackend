const asyncHandler =require('../../../shared/middlewares/async')
const ErrorResponse = require('../../../shared/utils/errorResponse');
const permissionservice = require ("../services/permission.service");


module.exports.getallpermission = asyncHandler (async(req,res, next)=>{
    try {
        const permissions = await permissionservice.getAllPermissions();
        res.status(permissions.status).json({success:permissions.success,message:permissions.message,data:permissions.data});
    } catch (error) {
        res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});

module.exports.getonepermission = asyncHandler (async(req,res, next)=>{
    try {
        const idpermission = req.params.id
        const permission = await permissionservice.getpermissionbyid(idpermission);
        res.status(permission.status).json({success:permission.success,message:permission.message,data:permission.data});
    }
    catch(error){
            res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});

module.exports.upsertpermission = asyncHandler (async(req,res, next)=>{
    try {
        const {code,libelle,createdby,updatedby} = req.body;
        const upsertpermission = await permissionservice.upsertpermission({code,libelle,createdby,updatedby})
        res.status(upsertpermission.status).json({success: upsertpermission.success,message:upsertpermission.message, data: upsertpermission.data});
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }
});

module.exports.deletepermission = asyncHandler (async(req,res, next)=>{
    try {
        const idpermission = req.params.id;
        const deletepermission = await permissionservice.deletepermission(idpermission);
        res.status(deletepermission.status).json({ success:deletepermission.success,message:deletepermission.message});
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }
});