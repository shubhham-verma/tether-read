import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
    if (isConnected)
        return;

    try {
        const conn = await mongoose.connect(process.env.NEXT_PUBLIC_mongo_uri, {
            dbName: 'tether_read',
            // useNewUrlParser: true,
            // useUnifiedTopology: true
        });

        isConnected = conn.connections[0].readyState === 1;
        console.log("Mongo connected");

    } catch (error) {
        console.error("Mongo connection failed: ", error);
        throw error;
    }
}