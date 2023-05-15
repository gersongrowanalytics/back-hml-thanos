const controller = {}

controller.MetMostrarProductos = async (req, res) => {

    const {  } = req.body;

    try{

        const products = prisma.master_productos.findMany({
            orderBy: {
                created_at: 'desc'
            },
            select: {
                cod_producto  : true,
                nomb_producto : true
            }
        })

        res.json({
            message: 'Lista de productos obtenidos correctamente',
            data : products,
            respuesta: true
        })

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de consultas los productos',
            devmsg  : error,
            respuesta : false
        })
    }
}


module.exports = controller