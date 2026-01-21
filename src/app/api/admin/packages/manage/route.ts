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
        const { id, name, price, credits, features, description } = body;

        if (!name || price === undefined || credits === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const data = {
            name,
            price: Number(price),
            credits: Number(credits),
            features: features || [],
            description: description || "",
            updatedAt: new Date().toISOString()
        };

        if (id) {
            // Update
            await adminDb.collection("aicoach_packages").doc(id).update(data);
            return NextResponse.json({ success: true, id });
        } else {
            // Create
            const docRef = await adminDb.collection("aicoach_packages").add({
                ...data,
                createdAt: new Date().toISOString()
            });
            return NextResponse.json({ success: true, id: docRef.id });
        }

    } catch (error) {
        console.error("Save Package Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split("Bearer ")[1];
        await adminAuth.verifyIdToken(token);

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        await adminDb.collection("aicoach_packages").doc(id).delete();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Delete Package Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
