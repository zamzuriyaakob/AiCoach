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

        // Fetch all transactions (MVP approach: fetch all. For scale, use aggregation queries)
        const snapshot = await adminDb.collection("aicoach_transactions").get();

        const stats: Record<string, any> = {
            deepseek: { requests: 0, errors: 0, tokensIn: 0, tokensOut: 0, lastUsed: null },
            openai: { requests: 0, errors: 0, tokensIn: 0, tokensOut: 0, lastUsed: null },
            together: { requests: 0, errors: 0, tokensIn: 0, tokensOut: 0, lastUsed: null },
        };

        snapshot.forEach(doc => {
            const data = doc.data();
            // Normalize provider key
            let key = (data.provider || "").toLowerCase();
            if (key.includes("deepseek")) key = "deepseek";
            else if (key.includes("openai") || key.includes("gpt")) key = "openai";
            else if (key.includes("together") || key.includes("grok") || key.includes("mistral")) key = "together";
            else key = "deepseek"; // Fallback

            if (!stats[key]) {
                // Determine if valid key or fallback
                stats[key] = { requests: 0, errors: 0, tokensIn: 0, tokensOut: 0, lastUsed: null };
            }

            stats[key].requests += 1;

            if (data.status === "error" || data.status === "failed") {
                stats[key].errors += 1;
            }

            stats[key].tokensIn += (data.tokens_in || 0);
            stats[key].tokensOut += (data.tokens_out || 0);

            // Track latest timestamp
            if (data.timestamp) {
                const ts = new Date(data.timestamp).getTime();
                if (!stats[key].lastUsed || ts > stats[key].lastUsed) {
                    stats[key].lastUsed = ts;
                }
            }
        });

        // Format for frontend
        return NextResponse.json(stats);

    } catch (error) {
        console.error("Analytics Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
