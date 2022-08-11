const { string } = require("joi");
const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const templateVersionSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        template_id: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true
        },
        stage: {
            type: Number,
            default: 0
        },
        level: {
            type: Number,
            default: 1
        },
        notes: {
            type: String,

        },
        version: {
            type: Number,
            default: 1
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
templateVersionSchema.plugin(toJSON);

/**
 *  @typedef TemplateVersion
 */
const TemplateVersion = mongoose.model('TemplateVersion', templateVersionSchema);

module.exports = TemplateVersion;