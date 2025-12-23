const asyncHandler =require('../../../shared/middlewares/async')
const ErrorResponse = require('../../../shared/utils/errorResponse');
const roleservice = require ("../services/role.service");


module.exports.getallroles = asyncHandler (async(req,res, next)=>{
    try {
        const roles = await roleservice.getAllRoles();
        res.status(roles.status).json({success:roles.success,message:roles.message,data:roles.data});
    } catch (error) {
        res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});

module.exports.getonerole = asyncHandler (async(req,res, next)=>{
    try {
        const idrole = req.params.id
        const role = await roleservice.getRoleByid(idrole);
        res.status(role.status).json({success:role.success,message:role.message,data:role.data});
    }
    catch(error){
            res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});

module.exports.upsertrole = asyncHandler (async(req,res, next)=>{
    try {
        const {code,libelle,createdby,updatedby} = req.body;
        const upsertrole = await roleservice.upsertrole({code,libelle,createdby,updatedby})
        res.status(upsertrole.status).json({success: upsertrole.success,message:upsertrole.message, data: upsertrole.data});
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }
});

module.exports.deleterole = asyncHandler (async(req,res, next)=>{
    try {
        const idrole = req.params.id;
        const deleterole = await roleservice.deleterole(idrole);
        res.status(deleterole.status).json({ success:deleterole.success,message:deleterole.message});
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }
});