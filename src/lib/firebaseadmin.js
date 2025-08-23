import admin from "firebase-admin";

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_firebase_projectId,
            clientEmail: process.env.NEXT_PUBLIC_firebase_client_email,
            privateKey: process.env.NEXT_PUBLIC_firebase_admin_private_key.replace(/\\n/g, '\n')
        })
    });
}

export { admin };