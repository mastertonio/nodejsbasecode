const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const sectionSchema = mongoose.Schema(
    {
        innerHTML: {
            type: String,
            default: null
        },
        order: {
            type: Number,
            default: 0
        },
        position: {
            type: Number,
            default: 0
        },
        parent: {
            type: String,
            default: null
        },
        template_version_id: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true
        }
    },
    {
        timestamps: true
    }
);

//add plugin that converts mongoose to json
sectionSchema.plugin(toJSON);

/**
*  @typedef Section
*/
const Section = mongoose.model('Section', sectionSchema);