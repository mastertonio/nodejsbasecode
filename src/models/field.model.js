const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const fieldSchema = mongoose.Schema(
    {
        uuid: {
            type: String,
            required: true
        },
        connection: {
            type: String,
            required: true
        },
        queue: {
            type: String,
            required: true
        },
        payload: {
            type: String,
            required: true
        },
        exception: {
            type: String,
            required: true
        },
        failed_at: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

//add plugin that converts mongoose to json
fieldSchema.plugin(toJSON);

/**
*  @typedef Field
*/
const Field = mongoose.model('Field', fieldSchema);