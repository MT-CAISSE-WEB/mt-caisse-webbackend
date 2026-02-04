const { CentreAnalytique, Devise, EnteteOperationCaisse, NatureOperation, Tiers, TypeOperation } = require('./foreign_models')
const JustificatifOperation = require('./justificatifoperation.model')
const DetailsJustificatifOperation = require('./detailsjustificatifoperation.model')
/* ===== JustificatifOperation Foreign Keys ===== */

JustificatifOperation.belongsTo(EnteteOperationCaisse, {
  foreignKey: "idoperation",
  as: "operation",
});

JustificatifOperation.belongsTo(Devise, {
  foreignKey: "iddevise",
  as: "devise",
});

/* ===== DetailsJustificatifOperation Foreign Keys ===== */

DetailsJustificatifOperation.belongsTo(JustificatifOperation, {
  foreignKey: "idjustificatif",
  as: "justificatif",
});

DetailsJustificatifOperation.belongsTo(NatureOperation, {
  foreignKey: "idnature",
  as: "nature",
});

DetailsJustificatifOperation.belongsTo(CentreAnalytique, {
  foreignKey: "idcentreanalytique",
  as: "centreAnalytique",
});

DetailsJustificatifOperation.belongsTo(Tiers, {
  foreignKey: "idtiers",
  as: "tiers",
});

module.exports = {
  JustificatifOperation,
  DetailsJustificatifOperation,
  EnteteOperationCaisse,
  Devise,
  NatureOperation,
  CentreAnalytique,
  Tiers,
  TypeOperation
};
