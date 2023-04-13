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

const connection = require("./database/db");
const { format } = require("./database/db");
const { render } = require("ejs");


// Rutas en archivos externos

const login = require("./public/routes/login")

app.use(login)


// Rutas gets
    app.get("/", (req,res) =>{
        if (req.session.username!=undefined) {
            // Consultamos el valor de las cuentas en la bd
            connection.query(`SELECT * FROM accounts where username ="${req.session.username}"`, async (error, rows, fields) => {
                if (error) {
                    res.send("Hubo un error al consultar la cuenta...")

                } else if (rows.length == 0) { // Si no se encontró ninguna cuenta
                    // console.log(rows)
                    res.render("index", { datos: "undefined", intcard: "undefined", intcash: "undefined",username:req.session.username })
                } else {// En el caso de que sí se hayan encontrado cuentas (en teoria siempre estaran cash y card por defecto)

                    // console.log(rows)
                    let card = 0
                    let cash = 0

                    for (x of rows) {
                        card = card + x.card
                        cash = cash + x.cash
                    }

                    connection.query(`SELECT cuentas, transport, restaurants, freetime, groceries, health, pet, shopping, bank, gift, home, family, others FROM categorias where username ="${req.session.username}"`, async (error, results, fields) => {
                        if (results.length == 0) {
                            res.render("index", { datos: { card: (card).toLocaleString('en'), cash: (cash).toLocaleString('en') }, intcard: card, intcash: cash, username: req.session.username })

                        } else {
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
                            let shopping = 0;
                            for (let x of results) {
                                if (x.cuentas == "Card") {

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
                                    shopping += x.shopping
                                }
                            }
                            cardExpenses = transport + restaurants + freetime + groceries + health + pet + bank + gift + home + family + others + shopping

                            transport = 0;
                            restaurants = 0;
                            freetime = 0;
                            groceries = 0;
                            health = 0;
                            pet = 0;
                            bank = 0;
                            gift = 0;
                            home = 0;
                            family = 0;
                            others = 0;
                            shopping = 0;

                            for (let x of results) {
                                if (x.cuentas == "Cash") {
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
                                    shopping += x.shopping
                                }
                            }
                            // console.log("transport es igual a: ",transport)


                            cashExpenses = transport + restaurants + freetime + groceries + health + pet + bank + gift + home + family + others + shopping
                            // console.log("CASH EXPENSES: ", cashExpenses)

                            card = card - cardExpenses
                            cash = cash - cashExpenses


                            res.render("index", { datos: { cash: (cash).toLocaleString('en'), card: (card).toLocaleString('en') }, intcard: card, intcash: cash, username: req.session.username })

                        }
                    })



                }
            })
        }else{
            res.render("login/message", { message: "no login" })
        }

        

    })

    app.get("/categorias", (req, res) => {

        if(req.session.username !=undefined){
            // Adquirimos la fecha actual para ponerla como fecha inicial en la app
            let fecha_actual = moment().format('YYYY-MM-DD')
            console.log(req.session.username)
            connection.query(`SELECT transport, restaurants, freetime, groceries, health, pet, shopping, bank, gift, home, family, others FROM categorias WHERE fechagasto="${fecha_actual}" AND username="${req.session.username}"`, async (error, rows, fields) => {
                if (error) {
                    console.log("Error: ", error)
                } else if (rows.length == 0) { // En el caso de que no se encuentren resultados en tal fecha
                    console.log("En la fecha actual, aún no se registran gastos", rows)
                    res.render("categorias", { total: "undefined", fecha_actual, data: "undefined" })
                } else { // EN EL CASO DE QUE SÍ SE ENCUENTREN RESULTADOS
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
                    let shopping = 0;
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
                        shopping += x.shopping
                    }
                    // console.log("transport es igual a: ",transport)
                    let total = transport + restaurants + freetime + groceries + health + pet + bank + gift + home + family + others + shopping

                    res.render("categorias", { fecha_actual, total: total, data: { transport: transport, restaurants, freetime, groceries, health, pet, bank, gift, home, family, others, shopping } })
                }
            })
        }else{
            res.render("login/message",{message:"no login"})
        }

       
    })
    
    app.get("/transactions", (req,res)=>{

        if (req.session.username != undefined) {
            fecha_actual= moment().format("YYYY-MM-DD")

                    connection.query(`SELECT name,card, cash, about, note, fecha FROM accounts WHERE fecha="${fecha_actual}" AND username ="${req.session.username}"`, async (err, results, field) => {
                        if (err) {
                            res.send(err)

                        } else if (results.length == 0) {
                            connection.query(`SELECT transport, restaurants, freetime, groceries, health, pet, shopping, bank, gift, home, family, others, notes,nombre,cuentas FROM categorias WHERE fechagasto="${fecha_actual}" AND username ="${req.session.username}"`, async (error, rows, fields) => {

                                if (error) {
                                    console.log(error)

                                } else if (rows.length == 0) {
                                    res.render("transactions", { datos: rows, fecha_actual: fecha_actual, ingresos: false })


                                } else {



                                    res.render("transactions", { datos: rows, fecha_actual: fecha_actual, ingresos: false })
                                }


                            })
                        } else if (results.length != 0) {

                            connection.query(`SELECT transport, restaurants, freetime, groceries, health, pet, shopping, bank, gift, home, family, others, notes,nombre,cuentas FROM categorias WHERE fechagasto="${fecha_actual}" AND username ="${req.session.username}"`, async (error, rows, fields) => {

                                if (error) {
                                    console.log(error)

                                } else if (rows.length == 0) {
                                    res.render("transactions", { datos: rows, fecha_actual: fecha_actual, ingresos: results })


                                } else {



                                    res.render("transactions", { datos: rows, fecha_actual: fecha_actual, ingresos: results })
                                }


                            })

                        }
                    })
        } else {
            res.render("login/message",{message:"no login"})

        }
        
    })

    app.get("/resumen",(req, res)=>{
        if (req.session.username != undefined) {
            res.render("resumen", { data: "undefined", total: 0, mensaje: "You must choose a time period to view the expense data." })

        } else {
            res.render("login/message",{message:"no login"})

        }

    })


app.post("/", async (req,res)=>{
    if (req.session.username != undefined) {
        let inputcard = req.body.inputcard
        let inputcash = req.body.inputcash
        let note = req.body.note
        let about = req.body.about
        let name = req.body.accountname
        if (note == "") {
            note = "No comment."

        }

        let fecha_actual = moment().format('YYYY-MM-DD')
        connection.query(`INSERT INTO accounts (card,cash, about, note,fecha,name,username) values("${inputcard}","${inputcash}","${about}","${note}","${fecha_actual}","${name}","${req.session.username}")`, async (error, rows, fields) => {
            if (error) {
                res.send("HUBO UN ERROR AL INGRESAR DINERO EN LA CUENTA")

            } else {
                res.redirect("/")
            }



        })
    } else {
        res.render("login/message",{message:"no login"})

    }
    
})

app.post("/categorias", async(req, res) => {
    if (req.session.username != undefined) {
        let fechaElegida = req.body.fecha_actual
        console.log("POST CATEGORIAS: ", req.session.username)
        connection.query(`SELECT transport, restaurants, freetime, groceries, health, pet, shopping, bank, gift, home, family, others FROM categorias WHERE fechagasto="${fechaElegida}" AND username ="${req.session.username}"`, async (error, rows, fields) => {
            if (error) {
                console.log("Error: ", error)
            } else if (rows.length == 0) {
                console.log("No se encontraron", rows)
                let fecha_actual = moment().format('YYYY-MM-DD')
                if (fechaElegida == fecha_actual) {
                    today = "good"

                } else {
                    today = "bad"
                }

                res.render("categorias", { total: "undefined", fecha_actual: fechaElegida, data: today })

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
                let shopping = 0;


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
                    shopping += x.shopping


                }
                let total = transport + restaurants + freetime + groceries + health + pet + bank + gift + home + family + others + shopping
                res.render("categorias", { fecha_actual: fechaElegida, total, data: { transport: transport, restaurants, freetime, groceries, health, pet, bank, gift, home, family, others, shopping } })
            }
        })
    } else {
        res.render("login/message",{message:"no login"})

    }
    


})


app.post("/add",async (req, res) => {
    if (req.session.username != undefined) {
        let cuenta = req.body.method
        let expense = req.body.expense
        let category = req.body.inputcategory
        let notes = req.body.notes
        if(notes==""){
            notes = "No comment."
        }
        let fechaElegida = req.body.inputfecha
        connection.query(`INSERT into categorias (fechagasto,cuentas,${category},notes,nombre,username) VALUES("${fechaElegida}","${cuenta}", ${expense},"${notes}","${category}","${req.session.username}");`,async function (error) {
            if (error) {
                console.log(error)
                
            }else{
                connection.query(`SELECT transport, restaurants, freetime, groceries, health, pet, shopping, bank, gift, home, family, others FROM categorias WHERE fechagasto="${fechaElegida}" AND username ="${req.session.username}"`, async (error, rows, fields) => {
                    if (error) {
                        console.log("Error: ", error)
                    } else if (rows.length == 0) {
                        console.log("No se encontraron", rows)
                        
        
                        res.render("categorias", {total:"undefined", fecha_actual: fechaElegida, data: "undefined" })
        
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
                        let shopping = 0;
        
        
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
                            shopping +=x.shopping
        
        
                        }
                        let total = transport + restaurants + freetime + groceries + health + pet + bank + gift + home + family + others + shopping
                        res.render("categorias", { fecha_actual: fechaElegida,total, data: { transport: transport, restaurants, freetime, groceries, health, pet, bank, gift, home, family, others,shopping } })
                    }
                })
            }
            
        })

        
    } else {
        res.render("login/message",{message:"no login"})

    }
        

    

})

app.post("/transactions",async (req,res)=>{
    if (req.session.username != undefined) {
    
        let fechaElegida = req.body.fecha_actual

    connection.query(`SELECT name,card, cash, about, note, fecha FROM accounts WHERE fecha="${fechaElegida}" AND username ="${req.session.username}"`, async (err, results, field) => {
        if (err) {
            res.send(err)
            
        }else if( results.length==0){
            connection.query(`SELECT transport, restaurants, freetime, groceries, health, pet, shopping, bank, gift, home, family, others, notes,nombre,cuentas FROM categorias WHERE fechagasto="${fechaElegida}" AND username ="${req.session.username}"`, async (error, rows, fields) => {

                if (error) {
                    console.log(error)

                } else if (rows.length == 0) {
                    res.render("transactions", { datos: rows, fecha_actual: fechaElegida, ingresos: false })


                } else {



                    res.render("transactions", { datos: rows, fecha_actual: fechaElegida, ingresos: false })
                }


            })
        } else if (results.length != 0){

            connection.query(`SELECT transport, restaurants, freetime, groceries, health, pet, shopping, bank, gift, home, family, others, notes,nombre,cuentas FROM categorias WHERE fechagasto="${fechaElegida}" AND username ="${req.session.username}"`, async (error, rows, fields) => {

                if (error) {
                    console.log(error)

                } else if (rows.length == 0) {
                    res.render("transactions", { datos: rows, fecha_actual: fechaElegida, ingresos:results })


                } else {

                

                    res.render("transactions", { datos: rows, fecha_actual: fechaElegida, ingresos: results })
                }


            })
            
        }
    })
    }else{res.render("login/message",{message:"no login"})}
    
    
    

    
    
})

app.post("/resumen", async (req,res)=>{
    if (req.session.username != undefined) {
    let day = req.body.dayInput
    let week = req.body.weekInput
    let month = req.body.monthInput
    let year = req.body.yearInput
    console.log("SEMANA: ",week)
    if (day!=undefined) {
        console.log(day)
        consulta = `SELECT * FROM categorias WHERE fechagasto = "${day}" AND username ="${req.session.username}";`
    } else if (week != undefined) {
        let numSemana = week.substring(week.length - 2)
        consulta = `SELECT * FROM categorias WHERE week(fechagasto) = "${numSemana}" AND username ="${req.session.username}";`
    } else if (month != undefined) {
        // console.log(month.substring(month.length - 2))
        let numMes = month.substring(month.length - 2)
        consulta = `SELECT * FROM categorias WHERE MONTH(fechagasto) = "${numMes}"AND username ="${req.session.username}";`

    } else if (year != undefined) {
        console.log(year)
        consulta = `SELECT * FROM categorias where year(fechagasto) = "${year}"AND username ="${req.session.username}";`
        
    }else{
        res.send("No se realizó la petición de forma debida...")
    }

    connection.query(consulta, async (error, rows)=>{
        if (error) {
            res.send("Hubo un error al consultar a la base de datos")
        }else if (rows.length !=0) {
            // console.log(consulta)
            // console.log(rows)
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
            let shopping = 0;


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
                shopping += x.shopping
            }
            let total = transport + restaurants + freetime + groceries + health + pet + bank + gift + home + family + others + shopping
            
        res.render("resumen", { mensaje:"choosed", total, data: { transport: transport, restaurants, freetime, groceries, health, pet, bank, gift, home, family, others, shopping } })

            
        }else{
            console.log("Está pasando por el no choosed")
            res.render("resumen", { data: "undefined", total: 0, mensaje: "You must choose a time period to view the expense data." })
        }
    })
    }else{
        res.render("login/message",{message:"no login"})
    }
    


})



app.listen(3000, (req,res)=>{
    console.log("Servidor al puerto 3000 de forma exitosa.")
})