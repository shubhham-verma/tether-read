import { connectDB } from "@/lib/mongodb";
import Book from "@/models/book";

export default async function handler(req, res) {
    await connectDB();

    if (req.method === "GET") {
        try {
            const books = await Book.find({});
            return res.status(200).json(books);

        } catch (error) {
            console.error("Failed to fetch books", error);
            return res.status(500).json({ error: "Failed to fetch books" });
        }
    }
}