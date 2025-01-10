const TeamModel = require("../models/team.model")


module.exports = class TasksController{
    static async getAllTeams(req:any,res:any,next:any){
        try {
            let {page = 0, name, fields} = req.query

            const documentCount = 10
            const allowedFields: string[] = ["_id","name","created_at","updated_at","lead_id","members"]

            let filters: {name?:RegExp} = {}    
            
            if(name) filters.name = new RegExp(`${name}`,'i')
                
            const requestedFields: string[] = fields ? fields.split(",") : allowedFields
            const validFields: string[] = requestedFields.filter(field =>allowedFields.includes(field))
            
            if(validFields.length === 0) return res.status(400).json({error:"Invalid fields requested"})

            if(!validFields.includes("_id")) validFields.push("-_id")
            

            const data = await TeamModel.find(filters,validFields).skip(page*documentCount).limit(documentCount)
            res.json(data)
        } catch (error:any) {
            res.status(500).json({message: error.message})
        }
    }

    static async getTeamById(req:any,res:any,next:any){
        try {
            let {fields} = req.query
            const allowedFields: string[] = ["_id","name","created_at","updated_at","lead_id","members"]

            const requestedFields: string[] = fields ? fields.split(",") : allowedFields
            const validFields: string[] = requestedFields.filter(field =>allowedFields.includes(field))

            if(validFields.length === 0) return res.status(400).json({error:"Invalid fields requested"})
            
            if(!validFields.includes("_id")) validFields.push("-_id")

            const data = await TeamModel.findById(req.params.id).select(validFields)
            if(data){
                res.status(200).json(data)
            }
            else{
                res.status(404).send()
            }
        } catch (error:any) {
            res.status(500).json({message:error.message})
        }
    }


    static async createTeam(req:any,res:any,next:any){
        const data = new TeamModel(req.body)
        try {
            const dataToSave = await data.save()
            res.status(201).json(dataToSave)
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    }

    static async deleteTeamById(req:any,res:any,next:any){
        try {
            const id = req.params.id
            const data = await TeamModel.findByIdAndDelete(id)
            if(data){
                res.send(`Document with ${data.name} has been deleted`)
            }
            else{
                res.status(404).send()
            }
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    }

    static async patchTeamById(req:any,res:any,next:any){
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
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    }
}