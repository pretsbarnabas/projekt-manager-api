const mongoose = require("mongoose")

const teamSchema = new mongoose.Schema({
    name:{
        required: true,
        type: String
    },
    created_at:{
        required: true,
        type: String
    },
    updated_at:{
        required: true,
        type: String
    },
    lead_id:{
        required: true,
        type: [String]
    },
    members:{
        required: false,
        type: [String]
    }
})

module.exports = mongoose.model("Team", teamSchema, "teams")