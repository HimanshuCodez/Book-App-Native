import cron from 'cron'
import https from 'https'


const job = new cron.CronJob("*/14 * * * *",function(){
    https.get(process.env.BACKEND_URL,(res)=>{
        if(res.statusCode ===200) console.log("Get request sent succesfully")
            else console.log("get request failed", res.statusCode)

            console.log("backend url",process.env.BACKEND_URL)
        
    })
    .on("error",(e)=>console.error("error while sending request",e))
})
export default job