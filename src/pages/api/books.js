import { connectDB } from "@/lib/mongodb";
import Book from "@/models/book";
import { admin } from '@/lib/firebaseadmin';
import mongoose from "mongoose";

const ALLOWED_SORT_FIELDS = {
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    title: "title",
    author: "author",
};

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

            const pageNum = Math.max(parseInt(req.query.page || "1", 10), 1);
            const limitNum = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 50);
            const sortField = ALLOWED_SORT_FIELDS[req.query.sort] || "createdAt";
            const sortOrder = (req.query.order || "desc").toLowerCase() === "asc" ? 1 : -1;
            const searchTerm = req.query.search?.trim() || "";
            const statusFilter = req.query.status?.toLowerCase() || "all";


            const sortObj = { [sortField]: sortOrder, _id: sortOrder };
            const filter = { userId: uid };

            if (searchTerm) {
                filter.$or = [
                    { title: { $regex: searchTerm, $options: "i" } },
                    { author: { $regex: searchTerm, $options: "i" } }
                ];
            }


            let query = Book.find(filter)
                .sort(sortObj)
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean();

            if (sortField === "title" || sortField === "author") {
                query = query.collation({ locale: "en", strength: 2 });
            }

            var books = await query;

            if (statusFilter !== "all") {
                books = books.filter(book => {
                    if (!book.progress) return false;

                    const [current, total] = book.progress.split("/").map(n => parseInt(n, 10));
                    if (isNaN(current) || isNaN(total)) return false;

                    if (statusFilter === "unread") return current === 0;
                    if (statusFilter === "reading") return current > 0 && current < total;
                    if (statusFilter === "completed") return current === total;

                    return true;
                });
            }

            const total = await books.length;


            const info = {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
                hasNext: pageNum * limitNum < total,
                hasPrev: pageNum > 1,
                sort: { by: sortField, order: sortOrder === 1 ? "asc" : "desc" }
            }

            return res.status(200).json({
                info,
                count: books.length,
                books
            });
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