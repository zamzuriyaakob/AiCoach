import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split("Bearer ")[1];
        await adminAuth.verifyIdToken(token);

        const snapshot = await adminDb.collection("aicoach_packages").get();
        const packages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(packages);

    } catch (error) {
        console.error("Fetch Packages Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
