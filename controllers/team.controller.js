const TeamModel = require("../models/team.model.js")


module.exports = class TasksController{
    static async getAllTeams(req,res,next){
        try {
            let {page = 0, name, fields} = req.query

            const documentCount = 10
            const allowedFields = ["_id","name","created_at","updated_at","lead_id","members"]

            let filters  = {}    
            
            if(name) filters.name = new RegExp(`${name}`,'i')
                
            const requestedFields = fields ? fields.split(",") : allowedFields
            const validFields = requestedFields.filter(field=>allowedFields.includes(field))
            
            if(validFields.length === 0) return res.status(400).json({error:"Invalid fields requested"})

            if(!validFields.includes("_id")) validFields.push("-_id")
            

            const data = await TeamModel.find(filters,validFields).skip(page*documentCount).limit(documentCount)
            res.json(data)
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }

    static async getTeamById(req,res,next){
        try {
            let {fields} = req.query
            const allowedFields = ["_id","name","created_at","updated_at","lead_id","members"]

            const requestedFields = fields ? fields.split(",") : allowedFields
            const validFields = requestedFields.filter(field=>allowedFields.includes(field))

            if(validFields.length === 0) return res.status(400).json({error:"Invalid fields requested"})
            
            if(!validFields.includes("_id")) validFields.push("-_id")

            const data = await TeamModel.findById(req.params.id).select(validFields)
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