import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { getGlobalSettings } from "@/lib/adminSettings";

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;
        const email = decodedToken.email;

        const userRef = adminDb.collection("aicoach_users").doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            // New User Setup
            const settings = await getGlobalSettings();

            await userRef.set({
                email: email,
                createdAt: new Date().toISOString(),
                assigned_provider: settings.defaultProvider, // Auto-assign from global settings
                credit_balance: 0, // Default start
                role: "user", // Default role
            });

            return NextResponse.json({
                success: true,
                status: "created",
                provider: settings.defaultProvider
            });
        }

        return NextResponse.json({
            success: true,
            status: "existing",
            provider: userDoc.data()?.assigned_provider
        });

    } catch (error) {
        console.error("Sync Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
