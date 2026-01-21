import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { getGlobalSettings } from "@/lib/adminSettings";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages, systemPrompt, systemCode } = body;

        let provider = "DeepSeek"; // Default
        let isInternal = false;
        let userId = "system";

        // Logic Branch 1: Internal System Widget
        if (systemCode === "SYS_INTERNAL_WIDGET") {
            isInternal = true;
            const settings = await getGlobalSettings();
            provider = settings.internalWidgetProvider;
            // No credit check
        }
        // Logic Branch 2: Authenticated User
        else {
            const authHeader = req.headers.get("Authorization");
            if (!authHeader?.startsWith("Bearer ")) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const token = authHeader.split("Bearer ")[1];
            try {
                const decodedToken = await adminAuth.verifyIdToken(token);
                userId = decodedToken.uid;
            } catch (e) {
                return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
            }

            // Fetch User Data from Isolated Collection
            const userRef = adminDb.collection("aicoach_users").doc(userId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                return NextResponse.json({ error: "User profile not found. Please relogin." }, { status: 404 });
            }

            const userData = userDoc.data();
            const accountType = userData?.account_type || "standard";

            // Billing Logic
            if (accountType === "exclusive") {
                // Bypass credit check and deduction for exclusive users
                provider = userData?.assigned_provider || "DeepSeek";
            } else {
                // Standard / Pro users
                const credits = userData?.credit_balance || 0;

                // Allow the balance to go negative (Post-billing).
                // This means we allow usage if credits are 0, but block if already negative.
                if (credits < 0) {
                    return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
                }

                // Use User's Assigned Provider
                provider = userData?.assigned_provider || "DeepSeek";

                // Deduct Credit (1 per request for now)
                await userRef.update({
                    credit_balance: FieldValue.increment(-1)
                });
            }
        }

        // 3. Select API Key based on Determined Provider
        let apiKey = "";
        let apiUrl = "";
        let model = "";

        switch (provider) {
            case "DeepSeek":
                apiKey = process.env.DEEPSEEK_API_KEY || "";
                apiUrl = "https://api.deepseek.com/v1/chat/completions";
                model = "deepseek-chat";
                break;
            case "OpenAI":
                apiKey = process.env.OPENAI_API_KEY || "";
                apiUrl = "https://api.openai.com/v1/chat/completions";
                model = "gpt-4";
                break;
            case "Together":
                apiKey = process.env.TOGETHER_AI_KEY || "";
                apiUrl = "https://api.together.xyz/v1/chat/completions";
                model = "mistralai/Mixtral-8x7B-Instruct-v0.1"; // Example default for Together
                break;
            default:
                apiKey = process.env.DEEPSEEK_API_KEY || "";
                apiUrl = "https://api.deepseek.com/v1/chat/completions";
                model = "deepseek-chat";
        }

        if (!apiKey) {
            console.error(`Missing API Key for provider: ${provider}`);
            return NextResponse.json({ error: "Service configuration error" }, { status: 500 });
        }

        // 4. Log Transaction (Isolated)
        await adminDb.collection("aicoach_transactions").add({
            userId: userId,
            provider: provider,
            type: isInternal ? "internal_widget" : "user_chat",
            timestamp: new Date().toISOString(),
            status: "initiated"
        });

        // 5. Call AI Provider
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: systemPrompt || "You are a helpful AI Coach." },
                    ...messages
                ],
                stream: true,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AI Provider Error:", errorText);
            return NextResponse.json({ error: "AI Service Unavailable" }, { status: response.status });
        }

        return new NextResponse(response.body);

    } catch (error: any) {
        console.error("Generate API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
