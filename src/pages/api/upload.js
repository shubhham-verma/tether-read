import formidable from "formidable";
import { connectDB } from "@/lib/mongodb";
import Book from "@/models/book";

export const config = {
    api: {
        bodyParser: false,
    }
}

export default async function handler(req, res) {

    if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });

    try {

        const form = formidable({ multiples: false });

        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err)
                    reject(err);
                else
                    resolve([fields, files]);
            });
        });

        const book = files.book;

        // console.log("Fields object:", fields);
        // console.log(book);

        if (!book)
            return res.status(400).json({ error: "No file uploaded" });

        // todo have actual code for r2 uploadment here later
        // const dummyR2Url = `https://dummy-r2-url.com/${file.originalFilename}`;
        const dummyR2Url = `https://dummy-r2-url.com/my-ebook.epub`;

        const titleVal = Array.isArray(fields.title) ? fields.title[0] : fields.title;
        const authorVal = Array.isArray(fields.author) ? fields.author[0] : fields.author;
        const userIdVal = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;

        // console.log("userIdVal ", userIdVal);

        await connectDB();
        const result = await Book.create({
            title: titleVal,
            author: authorVal,
            userId: userIdVal,
            fileUrl: dummyR2Url,
            uploadedAt: new Date()
        })

        res.status(200).json({
            message: "Book uploaded successfully",
            bookId: result._id,
            user: result.userId,
            time: result.uploadedAt
        });

    } catch (error) {
        console.error("Error uploading file: ", error);
        return res.status(500).json({ error: "internal server error" });
    }

}

