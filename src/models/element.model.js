const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const elementSchema = mongoose.Schema(
    {
        innerHTML: {
            type: String,
            default: null
        },
        template: {
            type: Object,
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
elementSchema.plugin(toJSON);

/**
*  @typedef Element
*/
const Element = mongoose.model('Element', elementSchema);