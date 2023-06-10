const controller = {}
const MostrarUsuariosController = require('../../../../Methods/Administrar/Usuarios/MostrarUsuarios/MostrarUsuarios')

controller.ValMostrarUsuarios = async ( req, res ) => {

    try{

        MostrarUsuariosController.MetMostrarUsuarios(req, res)
        
    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al obtener a los usuarios'
        })
    }
}

module.exports = controller