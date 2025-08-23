import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";
import { connectDB } from "@/lib/mongodb";
import Book from "@/models/book";
import { admin } from "@/lib/firebaseadmin";

export default async function handler(req, res) {

    if (req.method !== "GET")
        return res.status(405).json({ error: "Method not allowed" });

    try {

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized: Please provide a valid bearer token" });
        }

        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        await connectDB();

        const { bookId } = req.query;
        const book = await Book.findById(bookId);
        console.log("Db userid: ", book.userId.toString());
        console.log("uid: ", uid);

        if (!book)
            return res.status(401).json({ error: "Book not found" });
        if (book.userId.toString() !== uid)
            return res.status(401).json({ error: "Book does not belong to the user" });


        const command = new GetObjectCommand({
            Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME,
            Key: book.objectKey,
        })

        const signedUrl = await getSignedUrl(r2, command, { expiresIn: 900 }); // 15 min

        return res.status(200).json({ url: signedUrl });

    } catch (error) {
        console.error(error);

        switch (error.code) {
            case "auth/id-token-expired":
                return res.status(500).json({ error: "Token expired, please generate a new token" });

            case "auth/argument-error":
                return res.status(400).json({ error: "Unauthorized: Invalid or malformed token." });

            default:
                return res.status(500).json({ error: "Internal server error in generating signedUrl" });
        }
    }

};