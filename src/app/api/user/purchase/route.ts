import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const body = await req.json();
        const { packageId } = body;

        if (!packageId) {
            return NextResponse.json({ error: "Missing Package ID" }, { status: 400 });
        }

        // 1. Get Package Details
        const pkgRef = adminDb.collection("aicoach_packages").doc(packageId);
        const pkgDoc = await pkgRef.get();

        if (!pkgDoc.exists) {
            return NextResponse.json({ error: "Package not found" }, { status: 404 });
        }

        const pkgData = pkgDoc.data();
        const creditsToAdd = Number(pkgData?.credits || 0);
        const amount = Number(pkgData?.price || 0);

        // 2. Perform Transaction (Simulated Payment)
        // In real world, verify payment gateway callback here.

        // 3. Update User Credits
        const userRef = adminDb.collection("aicoach_users").doc(userId);

        await adminDb.runTransaction(async (t) => {
            t.update(userRef, {
                credit_balance: FieldValue.increment(creditsToAdd)
            });

            // 4. Log Transaction
            const transactionRef = adminDb.collection("aicoach_transactions").doc();
            t.set(transactionRef, {
                userId: userId,
                type: "purchase",
                packageId: packageId,
                packageName: pkgData?.name,
                creditsAdded: creditsToAdd,
                amountPaid: amount,
                timestamp: new Date().toISOString(),
                status: "completed",
                provider: "system" // internal system transaction
            });
        });

        return NextResponse.json({ success: true, creditsAdded: creditsToAdd });

    } catch (error) {
        console.error("Purchase Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
