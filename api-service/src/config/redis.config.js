import redis from 'redis'
import { Queue } from 'bullmq';

const client = redis.createClient({
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    }
})

client.on('error', (err)=>{
    console.error('Redis Client Error', err);
})

client.on('ready', ()=>{
    console.log('Redis Client Connected');
})

const jobQueue = new Queue('jobQueue', {
    connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        username: process.env.REDIS_USER,
        password: process.env.REDIS_PASSWORD,
    }
});
console.log('BullMQ Job Queue Created');

// const connectDB = async () => {
//     try{
//         await client.connect();
//         console.log('Connected to Redis');
//     }
//     catch(err){
//         console.error('Could not connect to Redis', err);
//         process.exit(1);
//     }
// }

export { client, jobQueue };