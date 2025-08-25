import { connectDB } from "@/lib/mongodb";
import Book from "@/models/book";
import { admin } from "@/lib/firebaseadmin";


export default async function handler(req, res) {
    await connectDB();

    const { bookId } = req.query;

    try {

        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        let uid = null;

        if (token) {
            const decodedToken = await admin.auth().verifyIdToken(token);
            uid = decodedToken.uid;
        } else {
            return res.status(401).json({ error: "Unauthorized: Please provide a valid token" });
        }

        if (req.method === "GET") {
            const book = await Book.findOne({ _id: bookId, userId: uid });

            if (!book) {
                return res.status(404).json({ error: "Book not found" });
            }
            if (book.userId !== uid)
                return res.status(404).json({ error: "Book does not belong to the user" });

            return res.status(200).json({ success: true, book });
        }

        return res.status(405).json({ error: "Method not allowed" });

    } catch (error) {
        console.error("Error fetching book:", error);
        return res.status(500).json({ error: "Server error" });
    }
}
