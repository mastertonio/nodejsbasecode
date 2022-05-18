const { array } = require("joi");
const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const storeValueSchema = mongoose.Schema(
    {
        calculator_id: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true
        },
        session_id: {
            type: String,
            default: null
        },
        value_array: {
            type: Array,
            default: null
        }
    },
    {
        timestamps: true
    }
);

//add plugin that converts mongoose to json
storeValueSchema.plugin(toJSON);

/**
 *  @typedef StoreValue
 */
const StoreValue = mongoose.model('StoreValue', storeValueSchema);

module.exports = StoreValue;