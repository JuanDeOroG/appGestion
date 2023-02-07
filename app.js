//Para instanciar los modulos de express
const express = require("express");

//Para Crear servidor de express
const app = express();

// Estos dos middleWare son para que el servidor entienda los datos mandados (JSON, TXT, etc) cuando los mandamos con peticiones y respuestas
app.use(express.urlencoded({extended:false}))
app.use(express.json())

// Para establecer la ruta de archivos static / public / resources, que es donde normalmente ponemos las imagenes, los css y esas cosas.
app.use("/resources", express.static("public"))
app.use("/resources",express.static(__dirname+"/public"))

// Para crear las variables de entorno, normalmente usadas para la base de datos de las apps
// lo importamos y luego le decimos la ubicación del archivo donde estarán las variables de entorno
const dotenv = require("dotenv")
dotenv.config({ path: "./env/.env" })

// para las sessiones de express:
const session = require("express-session")
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}))

app.get("/", (req,res) =>{
    res.send("Ok, está todo listo, manos a la obra xd bien rarito el man")
})

app.listen(3000, (req,res)=>{
    console.log("Servidor al puerto 3000 de forma exitosa.")
})