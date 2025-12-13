const natureOperationService = require("../services/natureoperation.service");

exports.get_natures = async (req, res) => {
    const data = await natureOperationService.get_all();
    res.status(200).json({ success: true, data });
};

exports.get_onenature = async (req, res) => {
    const data = await natureOperationService.get_one(req.params.idnature);
    if (!data) return res.status(404).json({ success: false, message: "Introuvable" });

    res.status(200).json({ success: true, data });
};

exports.create_nature = async (req, res) => {
    const data = await natureOperationService.create(req.body);
    res.status(201).json({ success: true, message: "Créé", data });
};

exports.update_nature = async (req, res) => {
    const data = await natureOperationService.update(req.params.idnature, req.body);
    res.status(200).json({ success: true, message: "Mis à jour", data });
};

exports.delete_nature = async (req, res) => {
    await natureOperationService.delete(req.params.idnature);
    res.status(200).json({ success: true, message: "Supprimé" });
};
