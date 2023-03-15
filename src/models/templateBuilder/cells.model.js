const { required, boolean } = require("joi");
const mongoose = require("mongoose");
const { toJSON } = require("../plugins");

const cellsBuilderSchema = mongoose.Schema(
    {
        dataType:{
            type:String,
            required: false,
            default:''
        },
        label:{
            type:String,
            required: false,
            default: ''
        },
        format:{
            type:String,
            required: false,
            default: ''
        },
        icon:{
            type:String,
            required: false,
            default: null
        },
        rightSection:{
            type:String,
            required: false,
            default: null
        },
        isDisabled:{
            type:boolean,
            required: false,
            default: null
        },
        isProcess:{
            type:boolean,
            required: false,
            default: null
        },

            address:{ // frontend -> UUID from frontend
                type: String,
                required: false,
                default: null
            },
            forcedValue:{
                type:Number,
                required: false,
                default: 0
            },
            format:{
                type:String,
                required: false,
                default: null
            },
            formula:{
                type:String,
                required: false,
                default: null
            },
            value:{
                type:Number,
                required: false,
                default: 0
            }

       },
    {
        timestamps: true
    }
);

//add plugin that converts mongoose to json
cellsBuilderSchema.plugin(toJSON);

/**
 *  @typedef cellsBuilder
 */
const cellsBuilder = mongoose.model('cellsBuilder', cellsBuilderSchema);

module.exports = cellsBuilder;