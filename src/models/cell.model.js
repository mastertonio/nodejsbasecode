const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const cellSchema = mongoose.Schema(
    {
        address: {
            type: String,
            required: true
        },
        sheet: {
            type: String,
            default: null
        },
        label: {
            type: String,
            default: null
        },
        type: {
            type: String,
            default: null
        },
        format: {
            type: String,
            default: null
        },
        formula: {
            type: String,
            default: null
        },
        value: {
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
cellSchema.plugin(toJSON);

/**
 *  @typedef Cell
 */
const Cell = mongoose.model('Cell', cellSchema);