const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

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
            default: null
        },
        unique_ip: {
            type: String,
            default: null
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
            default: null
        },
        linked_title: {
            type: Number,
            default: null
        },
        version: {
            type: Number,
            default: 1
        },
        status: {
            type: Number,
            default: null
        },
        importance: {
            type: Number,
            default: null
        },
        cloned_from_parent: {
            type: Number,
            default: null
        }
    },
    {
        timestamps: true
    }
);

//add plugin that converts mongoose to json
calculatorSchema.plugin(toJSON);

/**
 *  @typedef Calculator
 */
const Calculator = mongoose.model('Calculator', calculatorSchema);

module.exports = Calculator;