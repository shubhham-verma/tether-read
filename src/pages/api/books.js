import { connectDB } from "@/lib/mongodb";
import Book from "@/models/book";
import { admin } from '@/lib/firebaseadmin';
import mongoose from "mongoose";

export default async function handler(req, res) {

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        await connectDB();

        const { bookId, title, author, progress } = req.body;

        if (req.method === "GET") {
            const books = await Book.find({ userId: uid }).lean();
            return res.status(200).json({ total: books.length, books });
        }

        else {
            if (!bookId)
                return res.status(400).json({ error: "BookId must not be empty" });
            else if (!mongoose.Types.ObjectId.isValid(bookId)) {
                return res.status(400).json({ error: "Invalid book ID format" });
            }

            if (req.method === "PUT") {
                const book = await Book.findOneAndUpdate(
                    { _id: bookId, userId: uid },
                    {
                        ...(title && { title }),
                        ...(author && { author }),
                        ...(progress && { progress }),
                        updatedAt: new Date()
                    },
                    { new: true }
                );

                if (!book)
                    return res.status(404).json({ error: "Book not found or not owned by user" });

                return res.status(200).json({ messgae: "Book updated successfully", book });
            }

            else if (req.method === "DELETE") {
                const deletedBook = await Book.findOneAndDelete({ _id: bookId, userId: uid });

                if (!deletedBook) {
                    return res.status(404).json({ error: "Book not found or not owned by user" });
                }

                return res.status(200).json({ message: "Book deleted successfully" });
            }
            else
                return res.status(405).json({ error: "Method not allowed" });
        }



    } catch (error) {
        if (error.code === "auth/id-token-expired") {
            return res.status(401).json({
                error: "Unauthorized: Firebase ID token expired. Please refresh your login and try again.",
            });
        }
        else if (error.code === "auth/argument-error") {
            return res.status(400).json({ error: "Unauthorized: Invalid or malformed token." });
        }
        else {
            console.error("Error in GET /books:", error);
            console.log(error.code);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

}