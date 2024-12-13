const mongoose = require("mongoose")

const Schema = new mongoose.Schema({
    title:{
        required: true,
        type: String
    },
    description:{
        required: false,
        type: String
    },
    status:{
        required: true,
        type: String
    },
    assigned_to:{
        required: false,
        type: [String]
    },
    created_at:{
        required: true,
        type: String
    },
    updated_at:{
        required: true,
        type: String
    },
    team_id:{
        required: true,
        type: String
    },
    creator_id:{
        required: true,
        type: String
    }
})

module.exports = mongoose.model("Task",Schema,"tasks")