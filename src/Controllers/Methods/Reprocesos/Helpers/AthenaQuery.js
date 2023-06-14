controller = {}
const { 
    AthenaClient, 
    StartQueryExecutionCommand, 
    GetQueryResultsCommand, 
    GetQueryExecutionCommand,
} = require("@aws-sdk/client-athena")

controller.MetAthenaQuery = async (query) => {
    try{
        const athenaClient = new AthenaClient({ 
            region: 'us-east-2', 
            credentials: {
                accessKeyId: "AKIARV4HUKUVOO5RAYLS",
                secretAccessKey: "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",
            }
        })
    
        const params = {
            QueryString: query,
            WorkGroup: 'pesf',
            QueryExecutionContext: { Database: 'pe_sf_datalake' },
            ResultConfiguration: { OutputLocation: 's3://pe-sf-scripts/athena/' }
        }
    
        const startQueryExecutionCommand = new StartQueryExecutionCommand(params)
        const responseId = await athenaClient.send(startQueryExecutionCommand)
        let statusVar

        while(true){
            const params2 = { QueryExecutionId: responseId.QueryExecutionId }
            const getQueryExecutionCommand = new GetQueryExecutionCommand(params2)
            const responseStatus = await athenaClient.send(getQueryExecutionCommand)
            statusVar = responseStatus.QueryExecution
            if(statusVar.Status.State === 'SUCCEEDED'){
                break
            }else if(statusVar.Status.State === 'FAILED'){
                break
            }
            await new Promise((resolve) => setTimeout(resolve, 500))
        }
        
        if(statusVar.Status.State === 'SUCCEEDED'){
            const params3 = { QueryExecutionId: responseId.QueryExecutionId }
            const getQueryResultsCommand = new GetQueryResultsCommand(params3)
            const responseQuery = await athenaClient.send(getQueryResultsCommand)
            const rows = responseQuery.ResultSet.Rows
            const columnNames = rows[0].Data.map((column) => column.VarCharValue)
            const data = rows.slice(1).map((row) => {
                return row.Data.reduce((rowData, column, columnIndex) => {
                    const columnName = columnNames[columnIndex]
                    rowData[columnName] = column.VarCharValue
                    return rowData
                }, {})
            })

            return {
                respuesta: true,
                message: 'La consulta es exitosa',
                data: data
            }
        }else{
            return {
                respuesta: false,
                message: statusVar.Status.AthenaError.ErrorMessage,
                data: ''
            }
        }
    }catch(error){
        console.log(error);
        return {
            respuesta: false,
            message: error,
            data: ''
        }
    }
}

module.exports = controller