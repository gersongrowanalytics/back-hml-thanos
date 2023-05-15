const controller = {}

controller.MetMasterDT = async (req, res) => {

    const {  } = req.body;

    try{

        const prueba = ''

    }catch(error){
        console.log(error)
        res.status(500)
        res.json({
            message : 'Lo sentimos hubo un error al momento de ...',
            devmsg  : error
        })
    }
}


module.exports = controller