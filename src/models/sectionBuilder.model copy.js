const { required, boolean } = require("joi");
const mongoose = require("mongoose");
const { objectId } = require("../validations/custom.validation");
const { toJSON } = require("./plugins");

const sectionBuilderSchema = mongoose.Schema(
    { 
        company_id: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true
        },
        template_id:{
            type: mongoose.SchemaTypes.ObjectId,
            required: true
        },
        version_id:{
            type: mongoose.SchemaTypes.ObjectId,
            required: true   
        },
        
        section:[
            {
                order:{
                    type: Number,
                    required:false
                },
                headers:{
                    dataType: {
                        type:String,
                        required: false,
                        default:''
                    },
                    mainTitle:{
                        dataType:{
                            type:String,
                            required: false,
                        },
                        style:{
                            type:String,
                            required: false,
                        },
                        text:{
                            type:String,
                            required: false,
                        }
                    },
                    subTitle:{
                        dataType:{
                            type:String,
                            required: false,
                        },
                        text:{
                            type:String,
                            required: false,
                        }
                    },
                    description:{
                        type:String,
                        required: false,
                    },
                    quotes:{
                        dataType:{
                            type:String,
                            required: false,
                        },
                        position:{
                            type:String,
                            required: false,
                        },
                        elements:[
                            {
                                dataType:{
                                    type:String,
                                    required: false,
                                },
                                qoute:{
                                    text:{
                                        type:String,
                                        required: false,
                                    },
                                    author:{
                                        type:String,
                                        required: false,
                                    }
                                }
                            }
                        ]
                    },
                    content: {
                        dataType:{
                            type:String,
                            required: false,
                        },
                        elements:[
                            {
                                dataType:{
                                    type:String,
                                    required: false,
                                },
                                span:{
                                    type:String,
                                    required: false,
                                },
                                class:{
                                    type:String,
                                    required: false,
                                },
                                mediaOrigin:{
                                    type:String,
                                    required: false,
                                },
                                link:{
                                    type:String,
                                    required: false,
                                }
                            }
                        ]
                    }
        
                },
                grayContent:{
                    dataType:{
                        type:String,
                        required: false,
                    },
                    classes:{
                        type:String,
                        required: false,
                    },
                    elements:[
                        {
                            dataType:{
                                type:String,
                                required: false,
                            },
                            text:{
                                type:String,
                                required: false,
                            },
                            elements:[
                                {
                                    dataType:{
                                        type:String,
                                        required: false,
                                    },
                                    label:{
                                        type:String,
                                        required: false,
                                    },
                                    format:{
                                        type:String,
                                        required: false,
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
                                        type: Boolean,
                                        required: false,
                                        default: null
                                    },
                                    isProcess:{
                                        type: Boolean,
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
                            
                                   }
                            ]
                        }
                    ]
                }
            }
        ],
        
        
    },
    {
        timestamps: true
    }
);

//add plugin that converts mongoose to json
sectionBuilderSchema.plugin(toJSON);

/**
 *  @typedef SectionBuilder
 */
const sectionBuilder = mongoose.model('SectionBuilder', sectionBuilderSchema);

module.exports = sectionBuilder;