import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        author: String,
        userId: { type: String, required: true },
        objectKey: { type: String, required: true },
        cfi: { type: String, default: null },
        percentage: { type: Number, default: 0, max: [100, "Cannot set percentage value more than 100"] }
    },
    { timestamps: true }
)

export default mongoose.models.Book || mongoose.model("Book", BookSchema);
