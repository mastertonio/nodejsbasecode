const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const migrationSchema = mongoose.Schema(
    {
        migration: {
            type: String,
            required: true
        },
        batch: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

//add plugin that converts mongoose to json
migrationSchema.plugin(toJSON);

/**
*  @typedef Migration
*/
const Migration = mongoose.model('Migration', migrationSchema);