import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function GET() {
    try {
        const email = "admin@aadigitalproduct.com";
        const password = "Admin123!@#"; // Temporary password

        try {
            // Check if user exists
            const userRecord = await adminAuth.getUserByEmail(email);

            // If exists, update password
            await adminAuth.updateUser(userRecord.uid, {
                password: password,
            });

            return NextResponse.json({
                success: true,
                message: `User ${email} exists. Password reset to: ${password}`
            });

        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                // Create user
                await adminAuth.createUser({
                    email: email,
                    password: password,
                    displayName: "Admin Master",
                    emailVerified: true,
                });

                return NextResponse.json({
                    success: true,
                    message: `User ${email} created with password: ${password}`
                });
            }
            throw error;
        }

    } catch (error: any) {
        console.error("Setup Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
