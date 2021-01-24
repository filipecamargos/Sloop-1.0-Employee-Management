/*************************************
 * The Note Schema to set the way the 
 * note data job be stored
 *************************************/

//Import Mongoose
const mongoose = require('mongoose');

//Data Schena for the employee
const Schema = mongoose.Schema;

const noteSchema = new Schema({

    employeeName: {
        type: String,
        required: true
    },

    lead: {
        type: String,
        required: true
    },

    date: {
        type: String,
        required: true
    },

    otherLead: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: true
    },

    issue: {
        type: String,
        required: true
    },

    discussed: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

});

//Export it for external usage
module.exports = mongoose.model('Note', noteSchema);