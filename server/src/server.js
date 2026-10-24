import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
const port=Number(process.env.PORT)||5000;
if(process.env.NODE_ENV==='production'&&(!process.env.SESSION_SECRET||process.env.SESSION_SECRET.length<32)){console.error('SESSION_SECRET must be at least 32 characters in production.');process.exit(1);}
connectDB().then(()=>app.listen(port,()=>console.log(`StudyHub API listening on ${port}`))).catch(e=>{console.error(`Database connection failed: ${e.message}`);process.exit(1);});
