const controller = {}
const MetNoHmlCleanedController = require('../../../Methods/CargaArchivos/NoHml/NoHmlCleaned')

controller.ValNoHmlCleaned = async (req, res) => {
    await MetNoHmlCleanedController.MetNoHmlCleaned(req, res)
}

module.exports = controller