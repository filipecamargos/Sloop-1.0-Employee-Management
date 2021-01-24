/*************************************
 * The Employee Schema to set the alway the 
 * user should be set up
 *************************************/

//Import Mongoose
const mongoose = require('mongoose');

//Data Schena for the employee
const Schema = mongoose.Schema;

const employeeSchema = new Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    position: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

});

//Export it for external usage
module.exports = mongoose.model('Employee', employeeSchema);