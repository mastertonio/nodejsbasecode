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
        active: {
            type: Number,
            default: 1
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