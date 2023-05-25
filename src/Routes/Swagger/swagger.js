const approvals  = require('./Approvals')

let swagger = {
    "openapi": "3.0.0",
    "info": {
        "version": "1.0.0",
        "title": "Documentation HML THANOS"
    },
    "tags": [
        {
          "name": "Auth",
          "description": "Authentication users"
        },
        {
          "name": "Administration",
          "description": "Products and distributor administration"
        },
        {
          "name": "Manage",
          "description": "Users manage"
        },
        {
          "name": "File upload",
          "description": "File Uploads"
        },
        {
          "name": "Download Data",
          "description": "Download files"
        },
        {
          "name": "Approvals",
          "description": "Approved and not approved"
        }
    ],
    "paths":{

    }
}

swagger.paths = {
  ...swagger.paths,
  ...approvals
}
const jsonData = JSON.stringify(swagger);

module.exports = jsonData
