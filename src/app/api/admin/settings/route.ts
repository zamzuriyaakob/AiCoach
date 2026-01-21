import { NextRequest, NextResponse } from "next/server";
import { getGlobalSettings, updateGlobalSettings } from "@/lib/adminSettings";
import { adminAuth } from "@/lib/firebaseAdmin";

// Helper to verify admin
async function verifyAdmin(req: NextRequest) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return false;
    const token = authHeader.split("Bearer ")[1];
    try {
        await adminAuth.verifyIdToken(token);
        // In real app, check custom claims or email whitelist
        return true;
    } catch {
        return false;
    }
}

export async function GET(req: NextRequest) {
    const isAuth = await verifyAdmin(req);
    if (!isAuth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const settings = await getGlobalSettings();
    return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
    const isAuth = await verifyAdmin(req);
    if (!isAuth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await req.json();
        await updateGlobalSettings(body);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }
}
