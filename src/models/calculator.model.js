const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const calculatorSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        position: {
            type: String,
            default: null
        },
        template_version_id: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true
        },
        verification_code: {
            type: String,
            default: null
        },
        email_protected: {
            type: Number,
            default: 0
        },
        visits: {
            type: Number,
            default: 0
        },
        unique_ip: {
            type: String,
            default: 0
        },
        dt: {
            type: Date,
            default: Date.now
        },
        currency: {
            type: String,
            default: null
        },
        is_sf_opportunity: {
            type: Number,
            default: 0
        },
        template_link:{
            type: String,
            default: null
        },
        salesforce_id: {
            type: String,
            default: null
        },
        sfdc_link: {
            type: String,
            default: null
        },
        instance: {
            type: String,
            default: null
        },
        folder: {
            type: Number,
            default: 0
        },
        linked_title: {
            type: Number,
            default: 0
        },
        version: {
            type: Number,
            default: 1
        },
        status: {
            type: Number,
            default: 0
        },
        importance: {
            type: Number,
            default: 0
        },
        cloned_from_parent: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

//add plugin that converts mongoose to json
calculatorSchema.plugin(toJSON);
calculatorSchema.plugin(paginate);

/**
 *  @typedef Calculator
 */
const Calculator = mongoose.model('Calculator', calculatorSchema);

module.exports = Calculator;