const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const userPermissionSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.SchemaTypes.ObjectId,
            default: null,
            required: false
        },
        rs_access: {
            type: Number,
            default: null
        },
        company_id: {
            type: mongoose.SchemaTypes.ObjectId,
            default: null
        },
        company_access: {
            type: Number,
            default: null
        },
        template_id: {
            type: mongoose.SchemaTypes.ObjectId,
            default: null
        },
        template_access: {
            type: Number,
            default: null
        }
    },
    {
        timestamps: true
    }
);

//add plugin that converts mongoose to json
userPermissionSchema.plugin(toJSON);

/**
 *  @typedef UserPermission
 */
const UserPermission = mongoose.model('UserPermission', userPermissionSchema);

module.exports = UserPermission;