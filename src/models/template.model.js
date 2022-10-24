const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const templateBuilderSchema = mongoose.Schema({
    company_id:{
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    template_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    templateVersion_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    section:{
        type: Array,
        default: [
            
        ]
    }
    
});

//add plugin that converts mongoose to json
templateBuilderSchema.plugin(toJSON);
templateBuilderSchema.plugin(paginate);

/**
 *  @typedef templateBuilder
 */
const templateBuilder = mongoose.model('templateBuilder', templateBuilderSchema);

module.exports = templateBuilder;