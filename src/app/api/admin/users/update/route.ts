import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split("Bearer ")[1];
        await adminAuth.verifyIdToken(token);

        const body = await req.json();
        const { uid, account_type, credit_balance } = body;

        if (!uid) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const updates: any = {};
        if (account_type) updates.account_type = account_type;
        if (credit_balance !== undefined) updates.credit_balance = Number(credit_balance);

        await adminDb.collection("aicoach_users").doc(uid).update(updates);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Update User Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
