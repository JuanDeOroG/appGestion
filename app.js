//Para instanciar los modulos de express
const express = require("express");
const moment= require("moment")

//Para Crear servidor de express
const app = express();

// Estos dos middleWare son para que el servidor entienda los datos mandados (JSON, TXT, etc) cuando los mandamos con peticiones y respuestas
app.use(express.urlencoded({extended:false}))
app.use(express.json())

// Para establecer la ruta de archivos static / public / resources, que es donde normalmente ponemos las imagenes, los css y esas cosas.
app.use("/resources", express.static("public"))
app.use("/resources",express.static(__dirname+"/public"))

// Para usar el motor de vistas ejs (usar condicionales y bucles dentro del html)
app.set("view engine", "ejs")


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

const connection = require("./database/db")




// Rutas gets
    app.get("/", (req,res) =>{
        res.render("index.ejs")
    })

    app.get("/categorias", (req, res) => {

        // Adquirimos la fecha actual para ponerla como fecha inicial en la app
        let fecha_actual = moment().format('YYYY-MM-DD')
        console.log(fecha_actual)
        connection.query( `SELECT transport, restaurants, freetime, groceries, health, pet, shopping, bank, gift, home, family, others FROM categorias WHERE fechagasto="${fecha_actual}"`,(error,rows,fields)=>{
            if (error) {console.log("Error: ",error)
            } else if (rows.length == 0) { // En el caso de que no se encuentren resultados en tal fecha
                console.log("En la fecha actual, aún no se registran gastos", rows)
                
                

                res.render("categorias", {fecha_actual, data: "undefined" })

            } else { // EN EL CASO DE QUE SÍ SE ENCUENTREN RESULTADOS
                let transport=0;
                let restaurants = 0;
                let freetime = 0;
                let groceries = 0;
                let health = 0;
                let pet = 0;
                let bank = 0;
                let gift = 0;
                let home = 0;
                let family = 0;
                let others = 0;
                for (let x of rows) {
                    transport=transport + x.transport
                    restaurants += x.restaurants
                    freetime += x.freetime
                    groceries += x.groceries
                    health += x.health
                    pet += x.pet
                    bank += x.bank
                    gift += x.gift
                    home += x.home
                    family += x.family
                    others += x.others
                }
                // console.log("transport es igual a: ",transport)

                res.render("categorias", { fecha_actual, data: { transport: transport, restaurants, freetime, groceries, health, pet, bank, gift, home, family, others } })
            }
        })


    })

app.post("/categorias", async(req, res) => {
    // Adquirimos la fecha actual para ponerla como fecha inicial en la app
    let fechaElegida= req.body.fecha_actual

    connection.query(`SELECT transport, restaurants, freetime, groceries, health, pet, shopping, bank, gift, home, family, others FROM categorias WHERE fechagasto="${fechaElegida}"`, (error, rows, fields) => {
        if (error) {
            console.log("Error: ", error)
        } else if (rows.length == 0) {
            console.log("No se encontraron", rows)


            res.render("categorias", { fecha_actual:fechaElegida, data: "undefined" })

        } else {
            console.log("Sí se encontraron resultados (Post categorias)")
            let transport = 0;
            let restaurants = 0;
            let freetime = 0;
            let groceries = 0;
            let health = 0;
            let pet = 0;
            let bank = 0;
            let gift = 0;
            let home = 0;
            let family = 0;
            let others = 0;


            for (let x of rows) {
                transport = transport + x.transport
                restaurants+= x.restaurants
                freetime += x.freetime
                groceries += x.groceries
                health += x.health
                pet += x.pet
                bank += x.bank
                gift += x.gift
                home += x.home
                family += x.family
                others += x.others


            }

            res.render("categorias", { fecha_actual: fechaElegida, data: { transport: transport,restaurants,freetime,groceries,health,pet,bank,gift,home,family,others } })
        }
    })


})


app.post("/add",async (req, res) => {

    let cuenta = req.body.method
    let expense = req.body.expense
    let category = req.body.inputcategory
    let notes = req.body.notes
    let fechaElegida = req.body.inputfecha
    connection.query(`INSERT into categorias (fechagasto,cuentas,${category}) VALUES("${fechaElegida}","${cuenta}", ${expense});`,function (error) {
        if (error) {
            console.log(error)
            
        }
        
    })

    connection.query(`SELECT transport, restaurants, freetime, groceries, health, pet, shopping, bank, gift, home, family, others FROM categorias WHERE fechagasto="${fechaElegida}"`, (error, rows, fields) => {
        if (error) {
            console.log("Error: ", error)
        } else if (rows.length == 0) {
            console.log("No se encontraron", rows)
            

            res.render("categorias", { fecha_actual: fechaElegida, data: "undefined" })

        } else {
            console.log("Sí se encontraron resultados (Post add)")
            let transport = 0;
            let restaurants = 0;
            let freetime = 0;
            let groceries = 0;
            let health = 0;
            let pet = 0;
            let bank = 0;
            let gift = 0;
            let home = 0;
            let family = 0;
            let others = 0;


            for (let x of rows) {
                transport = transport + x.transport
                restaurants += x.restaurants
                freetime += x.freetime
                groceries += x.groceries
                health += x.health
                pet += x.pet
                bank += x.bank
                gift += x.gift
                home += x.home
                family += x.family
                others += x.others


            }

            res.render("categorias", { fecha_actual: fechaElegida, data: { transport: transport, restaurants, freetime, groceries, health, pet, bank, gift, home, family, others } })
        }
    })

    

})


app.listen(3000, (req,res)=>{
    console.log("Servidor al puerto 3000 de forma exitosa.")
})