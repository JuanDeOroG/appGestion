const mysql = require("mysql")
const connection = mysql.createPool({
    connectionLimit:10,
    host: "localhost",
    user: "root",
    password: "",
    database: "gestionapp"
})

connection.getConnection(function (error) {
    if (error) {
        console.log("Error de conexion:", error)
        return
    }else{    console.log("Todo correcto con la BD")
}

})

module.exports = connection;