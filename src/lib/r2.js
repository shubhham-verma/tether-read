import { S3Client } from "@aws-sdk/client-s3";

const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.NEXT_PUBLIC_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_R2_ACCESS_KEY,
        secretAccessKey: process.env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY
    }
});

export { r2 };