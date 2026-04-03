// index.js
const encaissementRule = require('./encaissement.rule');
const decaissementRule = require('./decaissement.rule');
const conversionRule = require('./conversion.rule');
const transfertRule = require('./transfert.rule');
const decaissementajRule = require('./decaissementaj.rule');

module.exports = {
    encaissement: encaissementRule,
    decaissement: decaissementRule,
    conversion: conversionRule,
    transfert : transfertRule,
    decaissementaj : decaissementajRule
};