var express = require('express');

app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Rutas

// ==========================
// Busqueda por coleccion
// ==========================

app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
        promesa = buscarHospitales(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Tipo de busqueda incorrecto',
                error: { message: 'Coleccion no valida' }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
            // al poner [tabla] le estoy diciendo que no es esa la palabra que quiero ponerle, sino que es el valor de esa variable
        });
    });

});


// ==========================
// Busqueda general
// ==========================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');// la i es un ignoreCase

    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ])
    .then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });
    
});


function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if(err) {
                    reject('Error al buscar hospitales', err);
                }
                else {
                    resolve(hospitales);
                }
            });
    });

}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if(err) {
                    reject('Error al buscar medicos', err);
                }
                else {
                    resolve(medicos);
                }
            });
    });

}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([ { 'nombre': regex }, { 'email': regex} ])
            .exec( (err, usuarios) => {
                if(err) {
                    reject('Error al buscar medicos', err);
                }
                else {
                    resolve(usuarios);
                }
            });
    });

}

module.exports = app;