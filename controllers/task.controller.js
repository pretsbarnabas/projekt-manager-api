const TaskModel = require("../models/task.model")

module.exports = class TaskController{
    
    static async getAllTasks(req,res){
        try {
            const title = req.query.title
            const status = req.query.status
            const teamId = req.query.teamId
            let data = await TaskModel.find()
            if(title)
                data = data.filter(data => data.title.toLowerCase().includes(title.toLowerCase()))
            if(status)
                data = data.filter(data => data.status.toLowerCase().includes(status.toLowerCase()))
            if(teamId)
                data = data.filter(data => data.team_id===teamId)
            res.json(data)
        } catch (error) {
            res.status(500).json({message:error.message})
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