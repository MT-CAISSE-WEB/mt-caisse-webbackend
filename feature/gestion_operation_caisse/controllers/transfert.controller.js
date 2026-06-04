const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");
const transfertservice = require("../services/transfert.service");


/**
 * Un transfert 
 */
module.exports.getalltransfert = asyncHandler(async(req, res, next) => {
  try {
    const transfert_ = await transfertservice.getAll_transfertfond();
    res.json({ success: true, data: transfert_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 *  Créer Un transfert de foncd
 */
module.exports.create_transfert = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const transfert_ = await transfertservice.create_transfertfond(data);
    res.json({ success: true, data: transfert_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 *  Update Un transfert de foncd
 */
module.exports.update_transfert = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const transfert_ = await transfertservice.update_transfertfond(data);
    res.json({ success: true, data: transfert_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 *  Delete Un transfert de foncd
 */
module.exports.update_transfert = asyncHandler(async(req, res, next) => {
  try {
    const idtransfert = req.params.id;
    const transfert_ = await transfertservice.delete_transfertfond(idtransfert);
    res.json({ success: true, data: transfert_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
