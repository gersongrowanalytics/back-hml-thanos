const controller = {}

controller.ValUserValidation = async (req, res) => {

    const { usutoken, middle_usuario } = req.headers;

    switch(true) {
        case !usutoken:
            res.status(400);
            res.json({ message: 'Ha ocurrido un error al identificar al usuario', response : false });
            break;
        case !middle_usuario:
            res.status(404);
            res.json({ message: 'Usuario no encontrado', response : false });
            break;
        default:
            res.status(200);
            res.json({ message: 'Usuario Validado Correctamente', response : true, usu: middle_usuario});
            break;
    }
}


module.exports = controller