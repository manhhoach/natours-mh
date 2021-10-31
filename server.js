const dotenv=require('dotenv')
dotenv.config({path: './config.env'});
const mongoose=require('mongoose')
const port=process.env.PORT || 8888;
const app=require('./app')

var DB=process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
//.connect('mongodb://localhost:27017/natours', {
.connect(DB, {
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(() =>{
   // console.log('DB connection successful')
})
  .catch(e=>{
    console.log(e);
   // console.log('DB connection fail')
})


app.listen(port, ()=>{
    console.log(`app running on http://localhost:${port}`);
})
process.on('unhandleRejection', err=>{
    console.log(err.name, err.message);
    server.close(()=>{
        process.exit(1);
    })
 
})
