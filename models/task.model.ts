const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
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
        type: mongoose.Schema.Types.ObjectId
    },
    creator_id:{
        required: true,
        type: String
    }
})

module.exports = mongoose.model("Task", taskSchema, "tasks")