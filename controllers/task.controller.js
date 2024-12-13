const TaskModel = require("../models/task.model")
const mongoose = require("mongoose")

module.exports = class TaskController{
    
    static async getAllTasks(req, res) {
        try {
            const { title, status, team_id, page = 0 } = req.query
            const documentCount = 10
    
            let filters = {}
            if (title) filters.title = new RegExp(title, 'i')
            if (status) filters.status = status
            if (team_id) {
                if (mongoose.Types.ObjectId.isValid(team_id)) {
                    filters.team_id = team_id
                } else {
                    return res.status(400).json({ message: "Invalid team_id format" })
                }
            }
    
            const data = await TaskModel.find(filters).skip(page * documentCount).limit(documentCount)
    
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    static async getTaskById(req,res){
        try {
            const data = await TaskModel.findById(req.params.id)
            if(data){
                res.status(200).json(data)
            }
            else{
                res.status(404).send()
            }
        } catch (error) {
            res.status(500).json({message:error.message})
        }
    }

    
    static async createTask(req,res){
        const data = new TaskModel(req.body)
        try {
            const dataToSave = await data.save()
            res.status(201).json(dataToSave)
        } catch (error) {
            res.status(400).json({message:error.message})
        }
    }

    static async deleteTaskById(req,res){
        try {
            const id = req.params.id
            const data = await TaskModel.findByIdAndDelete(id)
            if(data){
                res.send(`Task with name ${data.title} has been deleted`)
            }
            else{
                res.status(404).send()
            }
        } catch (error) {
            res.status(400).json({message:error.message})
        }
    }

    static async patchTaskById(req,res){
        try {
            const id = req.params.id
            const updatedData = req.body
            const options = {new:true}
            const result = await TaskModel.findByIdAndUpdate(id,updatedData,options)
            if(result){
                res.send(result)
            }
            else{
                res.status(404).send()
            }
        } catch (error) {
            res.status(400).json({message:error.message})
        }
    }
}