const dotenv=require('dotenv')
const mongoose=require('mongoose')
dotenv.config({path: './config.env'});
const fs=require('fs')
const Tour=require('./models/tourModel')
// database
const DB=process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
//.connect(process.env.DATABASE_LOCAL, {
.connect(DB, {
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology:true
}).then(() =>{
    console.log('DB connection successful')
})
  .catch(e=>{
      console.log(e);
      console.log('DB connection fail')
})


const tours=JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json','utf-8'));
const importData=async()=>{
    try{
    await Tour.create(tours);
    console.log('done');
    process.exit();
    }
    catch(e)
    {
 console.log(e);
    }
};

const deleteData=async()=>{
    try{
   await Tour.deleteMany()
    console.log('delete done');
    }
    catch(e)
    {
 console.log(e);
    }
}
if(process.argv[2]==='--import')
 importData()
else
 deleteData() 
console.log(process.argv);