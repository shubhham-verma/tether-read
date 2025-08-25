import { connectDB } from "@/lib/mongodb";
import Book from "@/models/book";
import { admin } from "@/lib/firebaseadmin";

export default async function handler(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: Please provide a valid bearer token" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    await connectDB();

    const { bookId } = req.query;
    try {
        const book = await Book.findById(bookId);
        if (!book)
            return res.status(401).json({ error: "Book not found" });
        if (book.userId.toString() !== uid)
            return res.status(401).json({ error: "Book does not belong to the user" });

        if (req.method === "GET") {
            return res.status(200).json({
                cfi: book.cfi
            })
        }

        else if (req.method === "PUT") {
            const { cfi, percentage } = req.body;

            book.cfi = cfi;
            book.percentage = percentage;

            if (!cfi)
                return res.status(500).json({ error: "CFI cannot be empty" });
            if (isNaN(percentage))
                return res.status(500).json({ error: "Percentage must be a number" });

            try {
                await book.save();
            } catch (error) {
                console.error("Error in saving book", error);
                return res.status(500).json({ error: "Internal server error in saving progress" });
            }

            return res.status(200).json({ success: "Book progress saved successfully" });
        }

    } catch (error) {
        console.error("Error in fetching book: ", error);
    }

}