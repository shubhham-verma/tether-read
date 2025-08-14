import admin from "firebase-admin";

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_projectId,
            clientEmail: process.env.NEXT_PUBLIC_client_email,
            privateKey: process.env.NEXT_PUBLIC_private_key.replace(/\\n/g, '\n')
        })
    });
}

export { admin };