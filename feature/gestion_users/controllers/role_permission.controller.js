const asyncHandler =require('../../../shared/middlewares/async')
const ErrorResponse = require('../../../shared/utils/errorResponse');
const rolepermissionservice = require ("../services/role_permission.service");

module.exports.getallrolepermissions = asyncHandler (async(req,res, next)=>{
    try {
        const rolepermissions = await rolepermissionservice.getAllrolepermission();
        res.status(rolepermissions.status).json({success:rolepermissions.success,message:rolepermissions.message,data:rolepermissions.data});
    } catch (error) {
        res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});

module.exports.getonerolepermission = asyncHandler (async(req,res, next)=>{
    try {
        const {idrole, idpermission} = req.params;
        const rolepermission = await rolepermissionservice.getrolepermissionByid(idrole, idpermission);
        res.status(rolepermission.status).json({success:rolepermission.success,message:rolepermission.message,data:rolepermission.data});
    } catch (error) {
        res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});

module.exports.upsertrolepermission = asyncHandler (async(req,res, next)=>{
    try {
        const {idrole, idpermission, createdby, updatedby} = req.body;
        const upsertrolepermission = await rolepermissionservice.upsertrolepermission({idrole, idpermission, createdby, updatedby})
        res.status(upsertrolepermission.status).json({success: upsertrolepermission.success,message:upsertrolepermission.message, data: upsertrolepermission.data});
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }   
});

module.exports.deleterolepermission = asyncHandler (async(req,res, next)=>{
    try {
        const {idrole, idpermission} = req.params;
        const deleterolepermission = await rolepermissionservice.deleterolepermission(idrole, idpermission);
        res.status(deleterolepermission.status).json({ success:deleterolepermission.success,message:deleterolepermission.message});
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }   
});

module.exports.getpermissionsbyrole = asyncHandler (async(req,res, next)=>{
    try {
        const id = req.params['id'];
        const permissions = await rolepermissionservice.getpermissionbyrole(id);
        res.status(permissions.status).json({success:permissions.success,message:permissions.message,data:permissions.data})
    } catch (error) {
       res.status(500).json({ success: false, message: "Erreur serveur", error }); 
    }
});

