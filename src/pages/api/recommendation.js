import { admin } from "@/lib/firebaseadmin";

export default async function handler(req, res) {

    try {

        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        let uid = null;

        if (token) {
            const decodedToken = await admin.auth().verifyIdToken(token);
            uid = decodedToken.uid;
        }
        else {
            return res.status(401).json({ error: "Unauthorized: Please provide a valid token" });
        }

        if (req.method === "POST") {

            const { books } = req.body;
            const prompt = `
                Recommend 5 books based on this list: ${JSON.stringify(books)}.
                Return ONLY JSON in this format:
                [
                { "title": "Book Title", "author": "Author Name" }
                ]`;

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "https://tether-read.vercel.app/",
                    "X-Title": "TetherRead",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    // model: "deepseek/deepseek-r1-0528:free",
                    model: "mistralai/mistral-small-3.2-24b-instruct:free",
                    messages: [{ role: "user", content: prompt }],
                    response_format: {
                        "type": "json_schema",
                        "json_schema": {
                            "name": "recommendations",
                            "strict": true,
                            "schema": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "title": { "type": "string" },
                                        "author": { "type": "string" },
                                        "goodreads_link": { "type": "string", "format": "uri" }
                                    },
                                    "required": ["title", "author", "goodreads_link"],
                                    "additionalProperties": false
                                }
                            }
                        }
                    }
                }),
            });

            const data = await response.json();
            console.log(data);
            // console.log(data.choices[0].message);
            let content = await data.choices[0]?.message?.content || "";
            content = content.replace(/```json/g, "").replace(/```/g, "").trim();
            // console.log(content);

            res.status(200).json({ recommendations: JSON.parse(content) });
            // res.status(200).json("ok");
        }
        else
            return res.status(405).json({ error: "Method not allowed" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });

    }
}