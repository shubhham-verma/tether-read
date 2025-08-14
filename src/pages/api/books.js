import { connectDB } from "@/lib/mongodb";
import Book from "@/models/book";
import { admin } from '@/lib/firebaseadmin';

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

        if (req.method === "GET") {
            const books = await Book.find({ userId: uid }).lean();
            return res.status(200).json({ total: books.length, books });
        }

        else if (req.method === "POST") {
            const { bookId, title, author, progress } = req.body;

            if (!bookId)
                return res.status(400).json({ error: "BookId must not be empty" });

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
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

}