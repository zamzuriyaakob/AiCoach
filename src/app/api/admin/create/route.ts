import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
    try {
        const { email, password, role, createdBy } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password required" }, { status: 400 });
        }

        // 1. Create User in Firebase Auth
        try {
            await adminAuth.createUser({
                email,
                password,
                displayName: role === "super_admin" ? "Super Admin" : "Admin User",
                emailVerified: true,
            });
        } catch (authError: any) {
            // If user already exists in Auth, we might still want to create the DB entry
            // but usually we should fail or warn.
            if (authError.code !== 'auth/email-already-exists') {
                throw authError;
            }
        }

        // 2. Create User Document in Firestore 'aicoach_admins' collection
        // Using email as document ID as per screenshot pattern
        await adminDb.collection("aicoach_admins").doc(email).set({
            email,
            password, // Storing password as per user screenshot (Note: Insecure, but requested pattern)
            role: role || "user_admin",
            isActive: true,
            createdAt: new Date().toISOString(),
            createdBy: createdBy || "system",
        });

        return NextResponse.json({ success: true, message: "Admin created successfully" });

    } catch (error: any) {
        console.error("Create Admin Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
