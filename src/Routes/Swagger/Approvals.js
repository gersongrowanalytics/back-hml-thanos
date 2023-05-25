let approvals = {
    "/approvals/get-master-products": {
        "get": {
            "tags": ["Approvals"],
            "summary": "Get master products",
            "responses": {
                "200": {
                    "description": "Lista de productos obtenidos correctamente",
                    "content" : {
                        "application/json" : {
                            "schema" : {
                                "type" : "object",
                                "properties" : {
                                    "message": {
                                        "type": "string",
                                        "example" : "Lista de productos obtenidos correctamente"
                                    },
                                    "respuesta": {
                                        "type": "boolean",
                                        "example" : true
                                    },
                                    "data": {
                                        "type": "array",
                                        "items" : {
                                            "type" :"object",
                                            "properties" : {
                                                "id" : {
                                                    "type" : "integer",
                                                    "example" : 1
                                                },
                                                "cod_producto" : {
                                                    "type" : "string",
                                                    "example" : "360374"
                                                },
                                                "nomb_producto" : {
                                                    "type" : "string",
                                                    "example" : "PH ELITE ECOLOGICO UH PLUS 500m X 4"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "500" : {
                    "description" : "Lo sentimos hubo un error al momento de consultas los productos",
                    "content" : {
                        "application/json" : {
                            "schema" : {
                                "type" : "object",
                                "properties" : {
                                    "message": {
                                        "type": "string",
                                        "example" : "Lo sentimos hubo un error al momento de consultas los productos"
                                    },
                                    "respuesta": {
                                        "type": "boolean",
                                        "example" : false
                                    },
                                    "devmsg": {
                                        "type": "string",
                                        "example" : "Error server"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "/approvals/get-approved-products": {
        "get": {
            "tags": ["Approvals"],
            "summary": "Get approved products",
            "responses": {
                "200": {
                    "description": "Productos homologados obtenidos correctamente",
                    "content" : {
                        "application/json" : {
                            "schema" : {
                                "type" : "object",
                                "properties" : {
                                    "message": {
                                        "type": "string",
                                        "example" : "Productos homologados obtenidos correctamente"
                                    },
                                    "respuesta": {
                                        "type": "boolean",
                                        "example" : true
                                    },
                                    "data": {
                                        "type": "array",
                                        "items" : {
                                            "type" :"object",
                                            "properties" : {
                                                "master_distribuidoras" : {
                                                    "type" : "object",
                                                    "properties" : {
                                                        "codigo_dt" : {
                                                            "type" : "string",
                                                            "example" : "LALIBERTAD.01.262635"
                                                        },
                                                        "nomb_dt" : {
                                                            "type" : "string",
                                                            "example" : "ALVAREZ BOHL - TRUJILLO"
                                                        },
                                                        "region" : {
                                                            "type" : "string",
                                                            "example" : "PROVINCIA"
                                                        }
                                                    }
                                                },
                                                "master_productos" : {
                                                    "type" : "object",
                                                    "properties" : {
                                                        "cod_producto" : {
                                                            "type" : "string",
                                                            "example" : "360442"
                                                        },
                                                        "nomb_producto" : {
                                                            "type" : "string",
                                                            "example" : "SE ELITE DOB EN 4 PLUS 100X24 30X30"
                                                        }
                                                    }
                                                },
                                                "id" : {
                                                    "type" : "integer",
                                                    "example" : 1
                                                },
                                                "codigo_producto" : {
                                                    "type" : "string",
                                                    "example" : "4480037"
                                                },
                                                "descripcion_producto" : {
                                                    "type" : "string",
                                                    "example" : "SERVILLETA ELIT INST CORTD CLS x300"
                                                },
                                                "desde" : {
                                                    "type" : "string",
                                                    "example" : "2023-05-18"
                                                },
                                                "hasta" : {
                                                    "type" : "string",
                                                    "example" : "2023-05-18"
                                                },
                                                "key" : {
                                                    "type" : "integer",
                                                    "example" : 0
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "500" : {
                    "description" : "Lo sentimos hubo un error al momento de mostrar los productos homologados",
                    "content" : {
                        "application/json" : {
                            "schema" : {
                                "type" : "object",
                                "properties" : {
                                    "message": {
                                        "type": "string",
                                        "example" : "Lo sentimos hubo un error al momento de mostrar los productos homologados"
                                    },
                                    "respuesta": {
                                        "type": "boolean",
                                        "example" : false
                                    },
                                    "devmsg": {
                                        "type": "string",
                                        "example" : "Error server"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "/approvals/upload-approved": {
        "post": {
            "tags": ["Approvals"],
            "summary": "Upload approvals",
            "requestBody" : {
                "required"  : true,
                "content"   : {
                    "application/json": {
                        "schema" : {
                            "type" : "object",
                            "properties" : {
                                "producto_so_id" : {
                                    "type" : "integer",
                                    "example" : 3
                                },
                                "producto_hml_id" : {
                                    "type" : "integer",
                                    "example" : 1
                                },
                                "req_desde" : {
                                    "type" : "string",
                                    "example" : "2023-05-18"
                                }
                            }
                        }
                    }
                }
            },
            "responses": {
                "200": {
                    "description": "El producto ha sido actualizado correctamente",
                    "content" : {
                        "application/json" : {
                            "schema" : {
                                "type" : "object",
                                "properties" : {
                                    "message": {
                                        "type": "string",
                                        "example" : "El producto ha sido actualizado correctamente"
                                    },
                                    "respuesta": {
                                        "type": "boolean",
                                        "example" : true
                                    }
                                }
                            }
                        }
                    }
                },
                "500" : {
                    "description" : "Lo sentimos no se encontro el producto seleccionado, recomendamos actualizar la pagina",
                    "content" : {
                        "application/json" : {
                            "schema" : {
                                "type" : "object",
                                "properties" : {
                                    "message": {
                                        "type": "string",
                                        "example" : "Lo sentimos no se encontro el producto seleccionado, recomendamos actualizar la pagina"
                                    },
                                    "respuesta": {
                                        "type": "boolean",
                                        "example" : false
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "/approvals/get-non-approved-products": {
        "post": {
            "tags": ["Approvals"],
            "summary": "Get non approved products",
            "requestBody" : {
                "required"  : true,
                "content"   : {
                    "application/json": {
                        "schema" : {
                            "type" : "object",
                            "properties" : {
                                "producto_so_id" : {
                                    "type" : "integer",
                                    "example" : 3
                                },
                                "producto_hml_id" : {
                                    "type" : "integer",
                                    "example" : 1
                                },
                                "req_desde" : {
                                    "type" : "string",
                                    "example" : "2023-05-18"
                                }
                            }
                        }
                    }
                }
            },
            "responses": {
                "200": {
                    "description": "Productos no homologados obtenidos correctamente",
                    "content" : {
                        "application/json" : {
                            "schema" : {
                                "type" : "object",
                                "properties" : {
                                    "message": {
                                        "type": "string",
                                        "example" : "Productos no homologados obtenidos correctamente"
                                    },
                                    "respuesta": {
                                        "type": "boolean",
                                        "example" : true
                                    },
                                    "data" : {
                                        "type" : "array",
                                        "items" : {
                                            "type" : "object",
                                            "properties" : {
                                                "master_distribuidoras" : {
                                                    "type" : "object",
                                                    "properties" : {
                                                        "nomb_dt" : {
                                                            "type" : "string",
                                                            "example" : "ALVAREZ BOHL - TRUJILLO"
                                                        },
                                                        "region" : {
                                                            "type" : "string",
                                                            "example" : "PROVINCIA"
                                                        }
                                                    }
                                                },
                                                "id" : {
                                                    "type" : "integer",
                                                    "example" : 2
                                                },
                                                "codigo_distribuidor" : {
                                                    "type" : "string",
                                                    "example" : "LALIBERTAD.01.262635"
                                                },
                                                "codigo_producto" : {
                                                    "type" : "string",
                                                    "example" : "4480046"
                                                },
                                                "descripcion_producto" : {
                                                    "type" : "string",
                                                    "example" : "PAP HIGINI RENDIPEL PRO DH 6x115mt"
                                                },
                                                "desde" : {
                                                    "type" : "string",
                                                    "example" : "2023-05-18"
                                                },
                                                "hasta" : {
                                                    "type" : "string",
                                                    "example" : "2023-05-18"
                                                },
                                                "s_ytd" : {
                                                    "type" : "string",
                                                    "example" : "0"
                                                },
                                                "s_mtd" : {
                                                    "type" : "string",
                                                    "example" : "0"
                                                },
                                                "key" : {
                                                    "type" : "integer",
                                                    "example" : 0
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "500" : {
                    "description" : "Lo sentimos hubo un error al momento de ...",
                    "content" : {
                        "application/json" : {
                            "schema" : {
                                "type" : "object",
                                "properties" : {
                                    "message": {
                                        "type": "string",
                                        "example" : "Lo sentimos hubo un error al momento de ..."
                                    },
                                    "devmsg": {
                                        "type": "string",
                                        "example" : "Error server"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "/approvals/register-product": {
        "post": {
            "tags": ["Approvals"],
            "summary": "Register product",
            "requestBody" : {
                "required"  : true,
                "content"   : {
                    "application/json": {
                        "schema" : {
                            "type" : "object",
                            "properties" : {
                                "producto_so_id" : {
                                    "type" : "integer",
                                    "example": 1
                                },
                                "producto_hml_id" : {
                                    "type" : "integer",
                                    "example": 2
                                },
                                "req_envio_otros" : {
                                    "type" : "boolean",
                                    "example": true
                                },
                                "productos_so_ids" : {
                                    "type" : "array",
                                    "example": [1, 2, 3]
                                }
                            }
                        }
                    }
                }
            },
            "responses": {
                "200": {
                    "description": "El producto ha sido homologado correctamente",
                    "content" : {
                        "application/json" : {
                            "schema" : {
                                "type" : "object",
                                "properties" : {
                                    "message": {
                                        "type": "string",
                                        "example" : "El producto ha sido homologado correctamente"
                                    },
                                    "respuesta": {
                                        "type": "boolean",
                                        "example" : true
                                    }
                                }
                            }
                        }
                    }
                },
                "500" : {
                    "description" : "Lo sentimos hubo un error al momento de ...",
                    "content" : {
                        "application/json" : {
                            "schema" : {
                                "type" : "object",
                                "properties" : {
                                    "message": {
                                        "type": "string",
                                        "example" : "Lo sentimos hubo un error al momento de ..."
                                    },
                                    "devmsg": {
                                        "type": "string",
                                        "example" : "Error server"
                                    },
                                    "respuesta": {
                                        "type": "boolean",
                                        "example" : false
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

module.exports = approvals