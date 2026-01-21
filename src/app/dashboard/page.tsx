"use client";

import { useAuth } from "@/context/AuthContext";
import { Users, Settings, FileText, Activity } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/context/ToastContext";

export default function DashboardPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { success } = useToast();

    useEffect(() => {
        const welcome = searchParams.get("welcome");
        if (welcome) {
            if (welcome === "created") {
                success("Welcome to AiCoach! Your account is ready.");
            } else if (welcome === "existing") {
                success(`Welcome back!`);
            }

            // Clean URL
            router.replace("/dashboard");
        }
    }, [searchParams, router, success]);

    const cards = [
        {
            title: "User Management",
            description: "View active users, manage subscriptions, and verify accounts.",
            icon: Users,
            role: "ALL ADMINS",
            color: "bg-blue-50 text-blue-600",
            border: "border-l-4 border-blue-500",
            href: "/dashboard/users",
        },
        {
            title: "System Config",
            description: "Manage AI providers, fallback strategies, and global API keys.",
            icon: Settings,
            role: "SUPER ADMIN",
            color: "bg-purple-50 text-purple-600",
            border: "border-l-4 border-purple-500",
            href: "/dashboard/config",
        },
        {
            title: "Prompt Templates",
            description: "Edit users system prompts and fine-tune AI generation logic.",
            icon: FileText,
            role: "SUPER ADMIN",
            color: "bg-pink-50 text-pink-600",
            border: "border-l-4 border-pink-500",
            href: "/dashboard/prompts",
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">
                    Welcome back, <span className="font-semibold text-gray-700">{user?.email || "admin"}</span>.
                    Role: <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 ml-1">SUPER_ADMIN</span>
                </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {cards.map((card, index) => (
                    <Link href={card.href} key={index} className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 relative overflow-hidden group border border-gray-100 ${card.border}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${card.color}`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">{card.role}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
                    </Link>
                ))}
            </div>

            {/* System Status Section (Placeholder for now) */}
            <div className="mb-6">
                <div className="flex items-center space-x-2 text-gray-900 font-bold mb-4">
                    <Activity className="w-5 h-5 text-gray-400" />
                    <h2>System Status</h2>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-3"></div>
                    <span className="text-sm text-gray-600 font-medium">Admin API: <span className="text-gray-900">Online</span></span>
                </div>
            </div>
        </div>
    );
}
