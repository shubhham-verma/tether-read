import formidable from "formidable";
import fs from "fs";
import { connectDB } from "@/lib/mongodb";
import Book from "@/models/book";
import { admin } from '@/lib/firebaseadmin';
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

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

        const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 }); // 20MB limit

        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err)
                    reject(err);
                else
                    resolve([fields, files]);
            });
        });

        const book = files.file || files.book;
        // console.log("fields: ", fields);
        // console.log("book: ", book);
        // console.log("mimetype: ", book.mimetype);

        if (!book)
            return res.status(400).json({ error: "No file uploaded" });

        // todo have actual code for r2 uploadment here later
        // const dummyR2Url = `https://dummy-r2-url.com/${file.originalFilename}`;
        // const dummyR2Url = `https://dummy-r2-url.com/my-ebook.epub`;

        const allowedTypes = ["application/epub+zip", "application/octet-stream"];
        if (!allowedTypes.includes(book[0].mimetype) && !book[0].originalFilename.endsWith(".epub"))
            return res.status(400).json({ error: "Invalid file type. Only .epub allowed" });

        // Create DB entry first (to get bookId)
        await connectDB();
        const dbBook = await Book.create({
            title: Array.isArray(fields.title) ? fields.title[0] : fields.title,
            author: Array.isArray(fields.author) ? fields.author[0] : fields.author,
            userId: uid,
            objectKey: "dummyKey",
            cif: "",
            percentage: 0,
            uploadedAt: new Date()
        });

        const randomSuffix = crypto.randomBytes(6).toString("hex");
        const objectKey = `${uid}/${dbBook._id} -${randomSuffix}.epub`;

        const fileStream = fs.createReadStream(book[0].filepath);
        const uploadParams = {
            Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME,
            Key: objectKey,
            Body: fileStream,
            ContentType: "application/epub+zip",

        };

        // console.log("uploadParams: ", uploadParams);
        await r2.send(new PutObjectCommand(uploadParams));

        dbBook.objectKey = objectKey;
        await dbBook.save();

        const signedUrl = await getSignedUrl(
            r2,
            new GetObjectCommand({
                Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME,
                Key: objectKey,
            }),
            { expiresIn: 900 } // 15 minutes
        );

        res.status(200).json({
            message: "Book uploaded successfully",
            bookId: dbBook._id,
            user: dbBook.userId,
            time: dbBook.uploadedAt,
            // signedUrl: "signedUrl"
            signedUrl: signedUrl
        });

    } catch (error) {
        if (error.code === "auth/id-token-expired") {
            return res.status(401).json({ error: "Unauthorized: Firebase ID token expired. Please refresh your login and try again." });
        }
        else if (error.code === "auth/argument-error") {
            return res.status(400).json({ error: "Unauthorized: Invalid or malformed token." });
        }
        else if (error.code === "PayloadTooLargeError") {
            return res.status(413).json({ error: "File too large. Max 5MB allowed" });
        }
        else {
            console.error("Error uploading file: ", error);
            return res.status(500).json({ error: "internal server error" });
        }
    }

}

