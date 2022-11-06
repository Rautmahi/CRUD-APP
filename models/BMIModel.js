



const mongoose=require("mongoose")


const userSchema= new mongoose.Schema({

    BMI:{type:Number,required:true},
    height:{type:String,required:true},
    weight:{type:String,required:true},  
    user_id:{type:String,required:true},  


}, {
    timestamaps:true
})
const BMIModel=mongoose.model("bmi",userSchema)


module.exports={BMIModel}