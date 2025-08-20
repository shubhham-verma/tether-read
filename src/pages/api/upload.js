import formidable from "formidable";
import { connectDB } from "@/lib/mongodb";
import Book from "@/models/book";
import { admin } from '@/lib/firebaseadmin';

export const config = {
    api: {
        bodyParser: false,
    }
}

export default async function handler(req, res) {

    if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });

    try {

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized: Please provide a valid bearer token" });
        }

        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const form = formidable({ multiples: false });

        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err)
                    reject(err);
                else
                    resolve([fields, files]);
            });
        });

        const book = files.file;
        console.log("book: ",book);
        console.log("fields: ",fields);

        if (!book)
            return res.status(400).json({ error: "No file uploaded" });

        // todo have actual code for r2 uploadment here later
        // const dummyR2Url = `https://dummy-r2-url.com/${file.originalFilename}`;
        const dummyR2Url = `https://dummy-r2-url.com/my-ebook.epub`;

        await connectDB();
        const result = await Book.create({
            title: Array.isArray(fields.title) ? fields.title[0] : fields.title,
            author: Array.isArray(fields.author) ? fields.author[0] : fields.author,
            userId: uid,
            fileUrl: dummyR2Url,
            progress: 0,
            uploadedAt: new Date()
        })

        res.status(200).json({
            message: "Book uploaded successfully",
            bookId: result._id,
            user: result.userId,
            time: result.uploadedAt
        });

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
            console.error("Error uploading file: ", error);
            return res.status(500).json({ error: "internal server error" });
        }
    }

}

