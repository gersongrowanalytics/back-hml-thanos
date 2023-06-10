const controller = {}

controller.MetEditarUsuario = async ( req, res ) => {

    try{

        
    }catch(err){
        console.log(err)
        res.status(500).json({
            response    : false,
            message     : 'Ha ocurrido un error al editar al usuario'
        })
    }
}

module.exports = controller