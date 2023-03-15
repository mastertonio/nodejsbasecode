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
        order:{
            type: Number,
            default: 0,
            required:true
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
                    default:''
                },
                style:{
                    type:String,
                    required: false,
                    default:''
                },
                text:{
                    type:String,
                    required: false,
                    default: ''
                }
            },
            subTitle:{
                dataType:{
                    type:String,
                    required: false,
                    default:''
                },
                text:{
                    type:String,
                    required: false,
                    default: ''
                }
            },
            description:{
                type:String,
                required: false,
                default:''
            },
            quotes:{
                dataType:{
                    type:String,
                    required: false,
                    default:''
                },
                position:{
                    type:String,
                    required: false,
                    default:''
                },
                elements:[
                    {
                        dataType:{
                            type:String,
                            required: false,
                            default:''
                        },
                        qoute:{
                            text:{
                                type:String,
                                required: false,
                                default: ''
                            },
                            author:{
                                type:String,
                                required: false,
                                default: ''
                            }
                        }
                    }
                ]
            },
            content: {
                dataType:{
                    type:String,
                    required: false,
                    default:''
                },
                elements:[
                    {
                        dataType:{
                            type:String,
                            required: false,
                            default:''
                        },
                        span:{
                            type:String,
                            required: false,
                            default:''
                        },
                        class:{
                            type:String,
                            required: false,
                            default:''
                        },
                        mediaOrigin:{
                            type:String,
                            required: false,
                            default:''
                        },
                        link:{
                            type:String,
                            required: false,
                            default:''
                        }
                    }
                ]
            }

        },
        // grayContent:{
        //     dataType:{
        //         type:String,
        //         required: false,
        //         default:''
        //     },
        //     classes:{
        //         type:String,
        //         required: false,
        //         default:''
        //     },
        //     elements:[
        //         {
        //             dataType:{
        //                 type:String,
        //                 required: false,
        //                 default:''
        //             },
        //             text:{
        //                 type:String,
        //                 required: false,
        //                 default: ''
        //             },
        //             elements:[
        //                 {
        //                     dataType:{
        //                         type:String,
        //                         required: false,
        //                         default:''
        //                     },
        //                     label:{
        //                         type:String,
        //                         required: false,
        //                         default: ''
        //                     },
        //                     format:{
        //                         type:String,
        //                         required: false,
        //                         default: ''
        //                     },
        //                     icon:{
        //                         type:String,
        //                         required: false,
        //                         default: null
        //                     },
        //                     rightSection:{
        //                         type:String,
        //                         required: false,
        //                         default: null
        //                     },
        //                     isDisabled:{
        //                         type:boolean,
        //                         required: false,
        //                         default: null
        //                     },
        //                     isProcess:{
        //                         type:boolean,
        //                         required: false,
        //                         default: null
        //                     },
                    
        //                         address:{ // frontend -> UUID from frontend
        //                             type: String,
        //                             required: false,
        //                             default: null
        //                         },
        //                         forcedValue:{
        //                             type:Number,
        //                             required: false,
        //                             default: 0
        //                         },
        //                         format:{
        //                             type:String,
        //                             required: false,
        //                             default: null
        //                         },
        //                         formula:{
        //                             type:String,
        //                             required: false,
        //                             default: null
        //                         },
        //                         value:{
        //                             type:Number,
        //                             required: false,
        //                             default: 0
        //                         }
                    
        //                    }
        //             ]
        //         }
        //     ]
        // }
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