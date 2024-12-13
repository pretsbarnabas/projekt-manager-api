const TeamModel = require("../models/team.model.js")


module.exports = class TasksController{
    static async getAllTeams(req,res,next){
        try {
            const {page = 0, name} = req.query
            const documentCount = 10

            let filters  = {}    
            if(name) filters.name = new RegExp(`${name}`,'i')
            
            const data = await TeamModel.find(filters,"name",).skip(page*documentCount).limit(documentCount)
            res.json(data)
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }

    static async getTeamById(req,res,next){
        try {
            const data = await TeamModel.findById(req.params.id)
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


    static async createTeam(req,res,next){
        const data = new TeamModel(req.body)
        try {
            const dataToSave = await data.save()
            res.status(201).json(dataToSave)
        } catch (error) {
            res.status(400).json({message:error.message})
        }
    }

    static async deleteTeamById(req,res,next){
        try {
            const id = req.params.id
            const data = await TeamModel.findByIdAndDelete(id)
            if(data){
                res.send(`Document with ${data.name} has been deleted`)
            }
            else{
                res.status(404).send()
            }
        } catch (error) {
            res.status(400).json({message:error.message})
        }
    }

    static async patchTeamById(req,res,next){
        try {
            const id = req.params.id
            const updatedData = req.body
            const options  ={new:true}
            const result = await TeamModel.findByIdAndUpdate(id,updatedData,options)
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