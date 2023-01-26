const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const templateBuilderSchema = mongoose.Schema(
    {   
        templateVersion_id: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true
        },
        headers:{},
        sidebar:{
            brand:{
                logo:{
                    type: String,
                    required:true
                },
                title:{
                    type: String,
                    required: true
                }
            },
            navigationMenu:[
                {
                    title:{
                        type:String,
                        required:true
                    },
                    icon:{
                        type:String,
                        required:true
                    },
                    link:{
                        type:String,
                        required:false,
                        default:null
                    },
                    menuSequence:{
                        type:Number,
                        required:true
                    },
                    navigationlist:[
                        {
                            link:{
                                type:String,
                                required:true
                            },
                            title:{
                                type:String,
                                required:true
                            },
                            listSequence:{
                                type:Number,
                                required:true
                            }
                        }
                    ]
                }
            ]
        },
        
        
        content:{
            sections:[
               
            ]
        }
        
    },
    {
        timestamps: true
    }
);

//add plugin that converts mongoose to json
templateBuilderSchema.plugin(toJSON);

/**
 *  @typedef Template
 */
const templateBuilder = mongoose.model('TemplateBuilder', templateBuilderSchema);

module.exports = templateBuilder;