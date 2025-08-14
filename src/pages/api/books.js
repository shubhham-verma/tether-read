import { connectDB } from "@/lib/mongodb";
import Book from "@/models/book";
import { admin } from '@/lib/firebaseadmin';

export default async function handler(req, res) {
    if (req.method != "GET")
        return res.status(405).json({ error: "Method not allowed" });
    else {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const idToken = authHeader.split("Bearer ")[1];
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const uid = decodedToken.uid;

            await connectDB();
            const books = await Book.find({ userId: uid }).lean();

            return res.status(200).json({ total: books.length, books });
        } catch (error) {
            if (error.code === "auth/id-token-expired") {
                return res.status(401).json({
                    error: "Firebase ID token expired. Please refresh your login and try again.",
                });
            }
            else if (error.code === "auth/argument-error") {
                return res.status(400).json({ error: "Invalid or malformed token." });
            }
            else {
                console.error("Error in GET /books:", error);
                return res.status(500).json({ error: "Internal Server Error" });
            }
        }
    }

}