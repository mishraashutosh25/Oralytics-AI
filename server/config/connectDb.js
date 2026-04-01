import mongoose from "mongoose"
import dotenv from 'dotenv'
dotenv.config()

const connectDb = async () => {
        try {
                await mongoose.connect(process.env.MONGODB_URL)
                console.log("DataBase Connected to system")
        } catch (error) {
                console.log(`Error while connecting to database ${error}`)
        }
}

export default connectDb;






