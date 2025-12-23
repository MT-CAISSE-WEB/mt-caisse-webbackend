const asyncHandler =require('../../../shared/middlewares/async')
const ErrorResponse = require('../../../shared/utils/errorResponse');
const userservice = require ("../services/users.service");



module.exports.getallusers = asyncHandler (async(req,res, next)=>{
    try {
        const users = await userservice.getalluser();
        res.status(users.status).json({success:users.success,message:users.message,data:users.data});
    } catch (error) {
        res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});


module.exports.getoneuser = asyncHandler (async(req,res, next)=>{
    try {
        const idutilisateur = req.params.id
        const user = await userservice.getoneuser(idutilisateur);
         res.status(user.status).json({success:user.success,message:user.message,data:user.data});
        
    } catch (error) {
         res.status(500).json({success:false, message:"Erreur serveur", error});
    }
});

module.exports.upsertuser = asyncHandler (async(req,res, next)=>{
    try {
        const {codeutilisateur,idsociete,nom,prenom,adresse,
            telephone,email,login,password,idrole,typeentitesite,
            typeentitedepartement,typeentitesociete,acheteur,
            createdby,updatedby} = req.body;

        const updateduser = await userservice.upsertuser({codeutilisateur,idsociete,nom,prenom,adresse,telephone,email,login,password,idrole,typeentitesite,typeentitedepartement,typeentitesociete,acheteur,createdby,updatedby})
        res.status(updateduser.status).json({success: updateduser.success,message:updateduser.message, data: updateduser.data});
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }
});

module.exports.deleteuser = asyncHandler (async(req,res, next)=>{
    try {
        const iduser = req.params.id;   
        const deleteuser = await userservice.deleteuser(iduser);
        res.status(deleteuser.status).json({ success:deleteuser.success,message:deleteuser.message});
    } catch (error) {       
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }           
});

module.exports.login = asyncHandler (async(req,res, next)=>{
    try {
            const {login,password} = req.body;

            const result = await userservice.login(login,password);

            res.status(result.status).json({success:result.success,message:result.message,data:result.data,token:result.token,refresh:result.refreshToken});
    }
    catch(error){
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }
});


module.exports.refresh = asyncHandler (async(req,res, next)=>{
    try {
            const {refreshtoken} = req.body;

            const result = await userservice.refreshtoken(refreshtoken);
            res.status(result.status).json({success:result.success,message:result.message,data:result.data});
    }
    catch(error){
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }
});

module.exports.logout = asyncHandler (async(req,res, next)=>{
    try {
            const {refreshtoken} = req.body;

            const result = await userservice.logout(refreshtoken);
             res.status(result.status).json({success:result.success,message:result.message,data:result.data});
    }
    catch(error){
        res.status(500).json({ success: false, message: "Erreur serveur", error });
    }
});
