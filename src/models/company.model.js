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
            default: null
        },
        active: {
            type: Number,
            default: 1
        },
        licenses: {
            type: Number,
            default: 1
        },
        templates: {
            type: Number,
            default: 1
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