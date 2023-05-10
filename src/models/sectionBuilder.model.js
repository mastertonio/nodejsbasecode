const { required, boolean } = require("joi");
const mongoose = require("mongoose");
const { objectId } = require("../validations/custom.validation");
const { toJSON } = require("./plugins");
const { unique } = require("underscore");

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
        
        sections:[
            {
                address:{
                    type: String,
                    required: false,
                    default: null,
                    unique:true
                },
                sectionTitle:{
                    type:String,
                    required: false,
                    default: null
                },
                order:{
                    type: Number,
                    required:false,
                    default: null
                },
                headers:{
                    title:{
                        dataType: {
                            type:String,
                            required: false,
                            default: null
                        },
                        mainTitle:{
                            dataType:{
                                type:String,
                                required: false,
                                default: null
                            },
                            style:{
                                type:String,
                                required: false,
                                default: null
                            },
                            text:{
                                type:String,
                                required: false,
                                default: null
                            }
                        },
                        subTitle:{
                            dataType:{
                                type:String,
                                required: false,
                                default: null
                            },
                            text:{
                                type:String,
                                required: false,
                                default: null
                            }
                        },
                        description:{
                            type:String,
                            required: false,
                            default: null
                        },
                        quotes:{
                            dataType:{
                                type:String,
                                required: false,
                                default: null
                            },
                            position:{
                                type:String,
                                required: false,
                                default: null
                            },
                            elements:[
                                {
                                    dataType:{
                                        type:String,
                                        required: false,
                                        default: null
                                    },
                                    qoute:{
                                        text:{
                                            type:String,
                                            required: false,
                                            default: null
                                        },
                                        author:{
                                            type:String,
                                            required: false,
                                            default: null
                                        }
                                    }
                                }
                            ]
                        },
                        content: {
                            dataType:{
                                type:String,
                                required: false,
                                default: null
                            },
                            elements:[
                                {
                                    dataType:{
                                        type:String,
                                        required: false,
                                        default: null
                                    },
                                    span:{
                                        type:String,
                                        required: false,
                                        default: null
                                    },
                                    class:{
                                        type:String,
                                        required: false,
                                        default: null
                                    },
                                    mediaOrigin:{
                                        type:String,
                                        required: false,
                                        default: null
                                    },
                                    text:{
                                        type:String,
                                        required: false,
                                        default: null
                                    },
                                    link:{
                                        type:String,
                                        required: false,
                                        default: null
                                    }
                                }
                            ]
                        }
                    }
                    
        
                },
                grayContent:{
                    dataType:{
                        type:String,
                        required: false,
                        default: null
                    },
                    classes:{
                        type:String,
                        required: false,
                        default: null
                    },
                    elements:[
                        {
                            address:{ // frontend -> UUID from frontend
                                type: String,
                                required: false,
                                default: null,
                                unique: true
                            },
                            choices:[
                                        {
                                            value:{
                                                type:String,
                                                required:false,
                                                default:""
                                            },
                                            label:{
                                                type:String,
                                                required:false,
                                                default:""
                                            }
                                        }
                                    ],
                
                            decimalPlace:{ 
                                type: String,
                                required: false,
                                default: null
                            },
                            currency:{ 
                                type: String,
                                required: false,
                                default: null
                            },
                            tooltip:{ 
                                type: String,
                                required: false,
                                default: null
                            },
                            appendedText:{ 
                                type: String,
                                required: false,
                                default: null
                            },
                            prefilled:{ 
                                type: String,
                                required: false,
                                default: null
                            },
                            dataType:{ 
                                type: String,
                                required: false,
                                default: null
                            },
                            text:{ // frontend -> UUID from frontend
                                type: String,
                                required: false,
                                default: null
                            },
                            toggle:{ // frontend -> UUID from frontend
                                type: Boolean,
                                required: false,
                                default: false
                            },
                            label:{
                                type:String,
                                required: false,
                                default: null
                            },
                            classes:{
                                type:String,
                                required: false,
                                default: null
                            },
                            title:{
                                type:String,
                                required: false,
                                default: null
                            },
                            sliderType:{
                                type:String,
                                required: false,
                                default: null
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