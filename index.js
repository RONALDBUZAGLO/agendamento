const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const AppointmentService = require("./services/AppointmentService");
const appointmentService = require('./services/AppointmentService');
const PORT = 3000;

app.use(express.static('public'));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');


mongoose.connect("mongodb://localhost:27017/agendamento" , { useNewUrlParser : true, useUnifiedTopology : true,useFindAndModify:false})


app.get('/', (req, res) => {
    res.render('index');
});

app.get('/cadastro' , (req , res)=>{
   res.render('create');
});

app.post('/create' ,async (req , res)=>{

    var status = await appointmentService.Create(
       req.body.name,
       req.body.email,
       req.body.description,
       req.body.cpf,
       req.body.date,
       req.body.time,
    );
    
    console.log(`rota post create status
    ${status}
    `);

    if(status){
        res.redirect("/");
    }else{
        res.send("ocorreu uma falha");
    }

});

app.get('/getcalendar' ,async (req , res)=>{
   var appointments = await AppointmentService.GetAll(false);
   console.log(`
   appointments = ${appointments}
   `);
   res.json(appointments);
});

app.get('/event/:id',async (req , res)=>{
    var appointment = await AppointmentService.GetById(req.params.id);
    console.log(appointment);
    res.render("event",{appo:appointment});
});

app.post('/finish', async(req,res)=>{
    var id = req.body.id;
    var result = await AppointmentService.Finish(id);
    res.redirect('/');
});

app.get("/list", async(req,res)=>{
    var appos = await AppointmentService.GetAll(false);
    res.render("list",{appos});
});

app.get("/searchresult",async (req,res)=>{
    var appos = await AppointmentService.Search(req.query.search);
    res.render("list",{appos});
});

var pollTime = 60000 * 0.1;

setInterval(async () => {
    // console.log(`a task rodou`);
    await AppointmentService.SendNotification();
}, pollTime);






 
app.listen(PORT, () => {
    console.log(`Server is listening at http: //localhost:${PORT}`);
});
