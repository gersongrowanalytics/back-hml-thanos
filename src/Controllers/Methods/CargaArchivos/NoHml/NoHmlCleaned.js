const controller = {}
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { resolve } = require('path')
const { MetDTManualesMasterClientesGrow } = require('../DTManuales/DTManualesMasterClientesGrow')
const { MetSendMail } = require('../../Reprocesos/SendMail')
const { MetRegisterAudits } = require('../../Audits/CreateAudits/RegisterAudits')

controller.MetNoHmlCleaned = async (req, res) => {
    const { usutoken } = req.headers
    const {
        req_data_nohml
    } = req.body

    let status = 200
    let response = true
    let message = "Se guardo correctamente todos los registros"

    let jsonentrada = { req_data_nohml: 'req_data_nohml' }
    let jsonsalida = {}
    let msgdev = ''
    let msgdevacc = []
    let audpk = []
    let usu = {}

    try{
        
        usu = await prisma.usuusuarios.findFirst({
            where: {
                usutoken : usutoken
            },
            select: {
                usuid       : true,
                usuusuario  : true,
            }
        })

        const res_add_no_homologados = await controller.FormDataNoHomologados(req_data_nohml, usu, msgdevacc, audpk)
        if(res_add_no_homologados.response){
            await controller.AddRegistersNoHomologados(res_add_no_homologados.form_data_no_homologados, res_add_no_homologados.pks_extractor, audpk)
        }

    }catch(error){
        console.log("MetNoHmlAutomatic", error)
        msgdev = error.toString()
        msgdevacc.push("MetNoHmlCleaned"+error.toString())
        response = false
        message = "Hubo un error al guardar los nuevos productos no homologados"
    }finally{

        const success_mail_html = resolve(__dirname, '../../Mails/CorreoRegisterNoHomologadoCleaned.html')
        const from_mail_data = process.env.USER_MAIL

        const subject_mail_success = "Carga no Hml Cleaned"
        const to_mail_data = [
            "Jose.Cruz@grow-analytics.com.pe",
            "Frank.Martinez@grow-analytics.com.pe",
        ]
        const to_mail_cc_data = []

        const data_mail = {
            tipo: "No HML", 
            usuario: usu ? usu.usuusuario : 'Sin usuario',
            msgerror: msgdevacc,
        }

        await MetSendMail(success_mail_html, from_mail_data, to_mail_data, subject_mail_success, data_mail, to_mail_cc_data)

        jsonsalida = { response, message, msgdev }
        await MetRegisterAudits(1, usutoken, null, jsonentrada, jsonsalida, 'NO HML', 'CREAR', '/carga-archivos/no-hml-cleaned', JSON.stringify(msgdevacc), audpk)

        await prisma.$disconnect()
        return res.status(status).json({
            response,
            message,
        }).end()
    }
}

controller.FormDataNoHomologados = async (data_no_homologados, usu, msgdevacc) => {

    let form_data_no_homologados = []
    let pks_extractor            = []

    try {
        const formattedDate = new Date().toISOString().slice(0, 10)
        const mcl_grow_local    = []
        const mcl_nogrow_local  = []

        for await(const nohml of data_no_homologados){
            let id_mcl_grow = null
            if(nohml.codigo_distribuidor){
                id_mcl_grow = await MetDTManualesMasterClientesGrow(nohml.codigo_distribuidor, mcl_grow_local, mcl_nogrow_local)
            }

            const cod_unidad_medida         = nohml.cod_unidad_medida ? nohml.cod_unidad_medida.toString().trim() : ''
            const unidad_medida             = nohml.unidad_medida ? nohml.unidad_medida.toString().trim() : ''
            const des_producto              = nohml.descripcion_producto ? nohml.descripcion_producto.toString().replace(/\r\n+/g, ' ').trim() : ''
            const codigo_distribuidor       = nohml.codigo_distribuidor ? nohml.codigo_distribuidor.toString().trim() : ''
            const codigo_producto           = nohml.codigo_producto ? nohml.codigo_producto.toString().trim() : ''
            const pk_venta_so               = codigo_distribuidor + codigo_producto
            const pk_extractor_venta_so     = codigo_distribuidor + codigo_producto + cod_unidad_medida + unidad_medida + des_producto
            const precio_unitario           = nohml.precio_unitario ? parseFloat(nohml.precio_unitario) : 0
            const cantidad                  = nohml.cantidad ? parseFloat(nohml.cantidad) : 0
            const s_mtd                     = nohml.s_mtd ? parseFloat(nohml.s_mtd) : 0
            const s_ytd                     = nohml.s_ytd ? parseFloat(nohml.s_ytd) : 0
            const ruc                       = nohml.ruc ? nohml.ruc.toString().trim() : ''
            const posibleCombo              = des_producto 
                                                ? des_producto.includes('+') ? true : false
                                                : false

            let data_master_productos_so = {
                m_dt_id : null,
                m_cl_grow : id_mcl_grow,
                m_pro_grow: null,
                usuid: null,
                homologado: false,
                pk_extractor_venta_so : pk_extractor_venta_so,
                pk_venta_so : pk_venta_so,
                pk_venta_so_hml : pk_venta_so,
                codigo_distribuidor : codigo_distribuidor,
                codigo_producto : codigo_producto,
                descripcion_producto : des_producto,
                precio_unitario : precio_unitario,
                ruc : ruc,
                desde : formattedDate,
                hasta : formattedDate,
                cantidad: cantidad,
                s_ytd : s_ytd,
                s_mtd : s_mtd,
                cod_unidad_medida : cod_unidad_medida,
                unidad_medida : unidad_medida,
                posible_combo : posibleCombo,
            }
            let automatic_homologado = false

            const condicion_seleccionar = ['noble','babysec','celeste','naranja','ladysoft','navidad','mundial','looney','diseño','cumple','torta','lineas','circulos','halloween','fiestas','patrias','verano','practica','ldsft','lady-soft','ladisoft','ultrasec','hipoal','dove','rexona','palos','dobby','cotidian','nova','higienol','nobl','touch','softmax','aloe','bb/sec','baby','hum','premium','natural soft','lady','nocturn','ultrafresh','humeda','menthol','ideal','suave','laminado','suav','megarrollo','flor','duo','lsdysoft','mega','aromas','paramonga','pet','natural sof' ]

            condicion_seleccionar.map(sel => {
                if(nohml.descripcion_producto.toLowerCase().includes(sel.toLowerCase())){
                    automatic_homologado = true
                }
            })

            if(automatic_homologado){
                data_master_productos_so = {
                    ...data_master_productos_so,
                    m_pro_grow: 268,
                    usuid: usu.usuid,
                    homologado: true,
                }
            }

            form_data_no_homologados.push(data_master_productos_so)
            pks_extractor.push(pk_extractor_venta_so)
        }

        return {
            form_data_no_homologados,
            pks_extractor,
            response: true,
        }
    }catch(error){
        msgdevacc.push("FormDataNoHomologados"+error.toString())
        console.log("FormDataNoHomologados", error)
        return {
            form_data_no_homologados: [],
            pks_extractor: [],
            response: false,
        }
    }
}

controller.AddRegistersNoHomologados = async (data_no_homologados, pks_extractor, audpk, msgdevacc) => {
    try {
        let data_add_nohml = []
        const prods_mps = await prisma.master_productos_so.findMany({
            where: {
                pk_extractor_venta_so: {
                    in: pks_extractor
                }
            }
        })

        for await(const nohml of data_no_homologados){
            const find_pk = prods_mps.find(prods => prods.pk_extractor_venta_so === nohml.pk_extractor_venta_so)
            if(find_pk){
                const updated_mps = await prisma.master_productos_so.update({
                    data: {
                        cantidad: nohml.cantidad,
                        s_mtd: nohml.s_mtd,
                        s_ytd: nohml.s_ytd,
                    },
                    where: {
                        id: find_pk.id,
                    }
                })
                audpk.push("master_productos_so-update-"+updated_mps.id)
            }else{
                data_add_nohml.push(nohml)
            }
        }

        await prisma.master_productos_so.createMany({
            data: data_add_nohml
        })

        data_add_nohml.map(nohml => {
            audpk.push("master_productos_so-create-"+nohml.pk_extractor_venta_so)
        })
    }catch(error){
        console.log("AddRegistersNoHomologados", error)
        msgdevacc.push("AddRegistersNoHomologados"+error.toString())
    }
}

module.exports = controller