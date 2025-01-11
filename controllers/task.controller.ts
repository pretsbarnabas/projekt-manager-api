const mongoose = require("mongoose")
const TaskModel = require("../models/task.model")
import { Projection } from "../models/projection.interface"
import * as tools from "../tools/tools"

class TaskController{
    
    static async getAllTasks(req:any, res:any) {
        try {
            let { title, limit=10, status, team_id, page = 0, fields, minCreateDate, maxCreateDate, minUpdateDate, maxUpdateDate, assigned_to, creator_id} = req.query

            limit = Number.parseInt(limit)
            page = Number.parseInt(page)
            if(Number.isNaN(limit) || Number.isNaN(page) || limit < 1 || page < 0){
                return res.status(400).json({error:"Invalid page or limit"})
            }
    
            const allowedFields: string[] = ["_id","title","description","status","assigned_to","created_at","updated_at","team_id","creator_id"]

            let filters: {title?:RegExp,status?:string,team_id?:string,assigned_to?:string[],creator_id?:string} = {}
            if (title) filters.title = new RegExp(title, 'i')
            if (status) filters.status = status
            if (team_id) {
                if (mongoose.Types.ObjectId.isValid(team_id)) {
                    filters.team_id = team_id
                } else {
                    return res.status(400).json({ message: "Invalid team ID format" })
                }
            }
            if (creator_id) {
                if (mongoose.Types.ObjectId.isValid(creator_id)) {
                    filters.creator_id = creator_id
                } else {
                    return res.status(400).json({ message: "Invalid creator ID format" })
                }
            }
            if(assigned_to){
                if(typeof assigned_to === "string"){
                    if (mongoose.Types.ObjectId.isValid(assigned_to)) {
                        filters.assigned_to = [assigned_to]
                    } else {
                        return res.status(400).json({ message: "Invalid assignedTo ID format" })
                    }
                }
                else if(Array.isArray(assigned_to)){
                    filters.assigned_to = assigned_to.map((id:string) => {
                        if (mongoose.Types.ObjectId.isValid(id)) {
                            return id
                        } else {
                            return res.status(400).json({ message: "Invalid assignedTo ID format" })
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
                
    
            const data = await TaskModel.aggregate([
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
    
            res.json(data);
        } catch (error:any) {
            res.status(500).json({ message: error.message })
        }
    }

    static async getTaskById(req:any,res:any){
        try {
            let {fields} = req.query
            const allowedFields: string[] = ["_id","title","description","status","assigned_to","created_at","updated_at","team_id","creator_id"]

            const requestedFields: string[] = fields ? fields.split(",") : allowedFields
            const validFields: string[] = requestedFields.filter(field =>allowedFields.includes(field))

            if(validFields.length === 0) return res.status(400).json({error:"Invalid fields requested"})
            
            if(!validFields.includes("_id")) validFields.push("-_id")

            const data = await TaskModel.findById(req.params.id).select(validFields)
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

    
    static async createTask(req:any,res:any){
        const data = new TaskModel(req.body)
        try {
            const dataToSave = await data.save()
            res.status(201).json(dataToSave)
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    }

    static async deleteTaskById(req:any,res:any){
        try {
            const id = req.params.id
            const data = await TaskModel.findByIdAndDelete(id)
            if(data){
                res.send(`Task with name ${data.title} has been deleted`)
            }
            else{
                res.status(404).send()
            }
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    }

    static async patchTaskById(req:any,res:any){
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
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    }
}

module.exports = TaskController