const TeamModel = require("../models/team.model")
const mongoose = require("mongoose")
import { Projection } from "../models/projection.interface"
import * as tools from "../tools/tools"

class TeamController{
    static async getAllTeams(req:any,res:any,next:any){
        try {
            let {page = 0, limit=10, name, fields, minCreateDate, maxCreateDate, minUpdateDate, maxUpdateDate, lead_id, members} = req.query

            limit = Number.parseInt(limit)
            page = Number.parseInt(page)
            if(Number.isNaN(limit) || Number.isNaN(page) || limit < 1 || page < 0){
                return res.status(400).json({error:"Invalid page or limit"})
            }

            const allowedFields: string[] = ["_id","name","created_at","updated_at","lead_id","members"]

            let filters: {name?:RegExp,lead_id?:string[],members?:string[]} = {}    
            
            if(name) filters.name = new RegExp(`${name}`,'i')
            if(lead_id){
                if(typeof lead_id === "string"){
                    if (mongoose.Types.ObjectId.isValid(lead_id)) {
                        filters.lead_id = [lead_id]
                    } else {
                        return res.status(400).json({ message: "Invalid lead ID format" })
                    }
                }
                else if(Array.isArray(lead_id)){
                    filters.lead_id = lead_id.map((id:string) => {
                        if (mongoose.Types.ObjectId.isValid(id)) {
                            return id
                        } else {
                            return res.status(400).json({ message: "Invalid lead ID format" })
                        }
                    })
                }
            }
            if(members){
                if(typeof members === "string"){
                    if (mongoose.Types.ObjectId.isValid(members)) {
                        filters.members = [members]
                    } else {
                        return res.status(400).json({ message: "Invalid member ID format" })
                    }
                }
                else if(Array.isArray(members)){
                    filters.members = members.map((id:string) => {
                        if (mongoose.Types.ObjectId.isValid(id)) {
                            return id
                        } else {
                            return res.status(400).json({ message: "Invalid member ID format" })
                        }
                    })
                }
            }

            if(!minCreateDate) minCreateDate = new Date(0).toISOString().slice(0,-5)
            if(!maxCreateDate) maxCreateDate = new Date().toISOString().slice(0,-5)
            if(!minUpdateDate) minUpdateDate = new Date(0).toISOString().slice(0,-5)
            if(!maxUpdateDate) maxUpdateDate = new Date().toISOString().slice(0,-5)

            if(!tools.isValidISODate(minCreateDate)|| !tools.isValidISODate(maxCreateDate) || !tools.isValidISODate(minUpdateDate || !tools.isValidISODate(maxUpdateDate))){
                return res.status(400).json({error:"Invalid date requested"})
            }
                
            const requestedFields: string[] = fields ? fields.split(",") : allowedFields
            const validFields: string[] = requestedFields.filter(field =>allowedFields.includes(field))
            
            if(validFields.length === 0) return res.status(400).json({error:"Invalid fields requested"})

            if(!validFields.includes("_id")) validFields.push("-_id")

            const projection: Projection = validFields.reduce((acc: Projection,field)=>{
                acc[field] = 1
                return acc
            }, {"_id": 0} as Projection)
            

            const data = await TeamModel.aggregate([
                {$match: filters},
                {$match: {$expr:{$gte:[
                    { $dateFromString: { dateString: "$created_at" } },
                    new Date(minCreateDate)
                ]}}},
                {$match: {$expr:{$lte:[
                    { $dateFromString: { dateString: "$created_at" } },
                    new Date(maxCreateDate)
                ]}}},
                {$match: {$expr:{$gte:[
                    { $dateFromString: { dateString: "$updated_at" } },
                    new Date(minUpdateDate)
                ]}}},
                {$match: {$expr:{$lte:[
                    { $dateFromString: { dateString: "$updated_at" } },
                    new Date(maxUpdateDate)
                ]}}},
                {$project: projection},
                {$skip: page*limit},
                {$limit: limit}
            ])

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

module.exports = TeamController