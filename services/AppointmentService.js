var appointment = require("../models/Appointment");
const mongoose = require('mongoose');
const AppointmenFactory = require('../factories/AppointmentFactory');
const mailer = require('nodemailer');

const Appo = mongoose.model("Appointment",appointment);

class AppointmentService {

    async Create(name,email,description,cpf,date,time){
        var newAppo = new Appo({
            name,
            email,
            description,
            cpf,
            date,
            time,
            finished:false,
            notified:false
        });
        try {
            await newAppo.save();
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    
    async GetAll(showFinished){
        if(showFinished){
            // console.log(`
            // showFinishe ${showFinished}
            // `);
            var appos = await Appo.find();
            var appointments = [];

            appos.forEach(appointment=>{
                if(appointment.date != undefined){
                    appointments.push(AppointmenFactory.Build(appointment));
                } 
            });

            return appointments;
            
            
        }else{
            var appos = await Appo.find({'finished':false});
            var appointments = [];

            appos.forEach(appointment=>{
                if(appointment.date != undefined){
                    appointments.push(AppointmenFactory.Build(appointment));
                } 
            });

            return appointments;
            
        }
    }

    async GetById(id){
        try {
            var event = await Appo.findOne({'_id':id});
            return event;
        } catch (err) {
            console.log(`Ocorreu erro no GetById: ${err}`);
        }
    }

    async Finish(id){
        try {
            await Appo.findByIdAndUpdate(id,{finished:true});
            return true;
        } catch (err) {
            console.log(`
            Erro durante o Finish: ${err}
            `);
            return false;
        }
    }

    async Search(query){
        try {
            var appos = Appo.find().or([{email:query},{cpf:query}]);    
            return appos;
        } catch (err) {
            console.log(`
            Erro no Search(): ${err}
            `);
            return [];
        }
        
    }

    async SendNotification(){
        
        var appos = await this.GetAll(false);

        var transporter = mailer.createTransport({
            host: 'smtp.mailtrap.io',
            port: 2525,
            auth:{
                user:'0a53c39118d09f',
                pass:'e50d931936e733'
            }
        });

        appos.forEach(async app=>{

            var date = app.start.getTime();
            var hour = 1000*60*60;//uma hora em milisegundos
            var gap = date - Date.now();

            if(gap <= hour){

                if (!app.notified) {
                    
                    transporter.sendMail({
                        from:'Ronald Buzaglo <ronald@ronald.com>',
                        to: app.email,
                        subject: "Sua consulta vai acontecer em breve",
                        text: "Conteúdo qualquer... Sua Consulta vai acontecer em uma hora..."
                    }).then(async ()=>{
                        console.log(`email enviado`);
                        await Appo.findByIdAndUpdate(app.id,{notified:true});
                    }).catch(err=>{
                        console.log(`Erro no envio do email: ${err}`);
                    });

                }
                

            }

        })
    }

}

module.exports = new AppointmentService();