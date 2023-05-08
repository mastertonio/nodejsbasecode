const { string } = require("joi");
const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const templateSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        company_id: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true
        },
        projection: {
            type: Number,
            default: 1
        },
        active: {
            type: Number,
            default: 1
        },
        notes: {
            type: String,
            required: false
        },
        created_by: {
            type: mongoose.SchemaTypes.ObjectId,
            required:true
        }
    },
    {
        timestamps: true
    }
);

//add plugin that converts mongoose to json
templateSchema.plugin(toJSON);

/**
 *  @typedef Template
 */
const Template = mongoose.model('Template', templateSchema);

module.exports = Template;