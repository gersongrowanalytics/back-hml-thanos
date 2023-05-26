const apiKey = process.env.OPENAI_API_KEY;
const { Configuration, OpenAIApi } = require("openai");
const controller = {}
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

// openai.api_key = apiKey;

// Crea un objeto para almacenar el estado de la sesión
let sessionState = {};

controller.MetObtenerProductosSimilares = async (req, res) => {

    const { 
        req_desc_producto_no_hml
    } = req.body;

    try{
        const products = await prisma.master_productos.findMany({
            orderBy: {
                created_at: 'desc'
            },
            select: {
                cod_producto : true,
                nomb_producto : true
            }
        })
    
        const list_products = JSON.stringify(products)
    
        const configuration = new Configuration({
            apiKey: apiKey,
        });
    
        // const prompt = 'Dame los códigos de los productos que puede estar dirigido la siguiente descripción: "'+req_desc_producto_no_hml+'" de la siguiente lista: '+list_products
        const prompt = 'Dame nombres para una empresa de tecnologia'
    
        const openai = new OpenAIApi(configuration);
    
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            temperature: 0,
            max_tokens: 1000,
        });
    
        console.log(response.data)
    
        let response_chat = response.data.choices
    
    
        return res.json({ 
            message: response_chat, 
            prompt: prompt
        });
    } catch(error){
        console.log("catch error");
        return res.json({ 
            data: error
        });
    }
    
    
}

module.exports = controller