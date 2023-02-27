const express = require("express")
const session = require("express-session")

const app = express.Router()
const connection = require("../../database/db");

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true
}))

app.get("/login",(req,res)=>{
    res.render("login/login")
    
})

app.get("/register", (req, res) => {
    res.render("login/register")
})

app.post("/register", async(req, res)=>{
    let username = req.body.username
    let password = req.body.password
    let email = req.body.email

    connection.query(`INSERT INTO USERS (username,password,email) values ("${username}","${password}","${email}")`, async (error) => {
        if (error) {
            if (error.errno == 1062) {
                res.render("login/message",{message:"user already exist"})
                
            }else{
            console.log("ERROR ",error)
            res.send("problems with the database...")
            }

        } else {
            res.render("login/message",{message:"registrado"})
        }
    })

})

app.post("/auth", async (req,res)=>{
    // Traemos los inputs mandados yu los guardamos en una variable para luego usar lo que el usuario digitó
    let username= req.body.username
    let password = req.body.password

    connection.query(`SELECT * from users WHERE username="${username}" AND password="${password}"`,async (error,rows)=>{
        if (error) {
            console.log(error)
            res.send("Hubo un error...")
            
        }else if(rows.length!=0){
           
            // Creamos las variables de session para luego usar el nombre de usuario en el html
            req.session.username=username
            req.session.password = password
            console.log(req.session.username)
            res.redirect("/")
        }else if(rows.length==0){
            res.send("No se encontró ningun usuario")
        }else{
            res.send("Algo extraño sucedió...")
        }
    })

})
module.exports = app;