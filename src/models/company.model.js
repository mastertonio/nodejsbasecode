const { required } = require("joi");
const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const companySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        alias: {
            type: String,
            default: ""
        },
        active: {
            type: Number,
            default: 1
        },
        licenses: {
            type: Number,
            default: 1
        },
        contact_fname:{
            type: String,
            required: true
        },
        contact_lname:{
            type: String,
            required: true
        },
        contact_email:{
            type: String,
            required: true
        },
        contact_phone:{
            type: String,
            required: true
        },
        contract_file:{
            type: String,
            required:false,
            default: ""
        },
        contract_start_date:{
            type: Date,
            required: false,
            default: ""
        },
        contract_end_date:{
            type: Date,
            required: false,
            default: ""
        },
        notes:{
            type: String,
            required: false,
            default: ""
        },
        templates: {
            type: Number,
            default: null,
            required: false
        }
    },
    {
        timestamps: true
    }
);
//add plugin that converts mongoose to json
companySchema.plugin(toJSON);

/**
 *  @typedef Company
 */
const Company = mongoose.model('Company', companySchema);

module.exports = Company;