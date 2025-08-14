import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        author: String,
        userId: { type: String, required: true },
        fileUrl: { type: String, required: true },
        progress: Number
    },
    { timestamps: true }
)

export default mongoose.models.Book || mongoose.model("Book", BookSchema);
