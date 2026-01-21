"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Settings,
    FileText,
    LayoutTemplate,
    Sparkles,
    History,
    Receipt,
    Mail,
    LogOut,
    AlertCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "User Management", href: "/dashboard/users", icon: Users },
    { name: "Configuration", href: "/dashboard/config", icon: Settings },
    { name: "Prompt Templates", href: "/dashboard/prompts", icon: FileText },
    { name: "Template Manager", href: "/dashboard/templates", icon: LayoutTemplate },
    { name: "Features & FX", href: "/dashboard/features", icon: Sparkles },
    { name: "Generated History", href: "/dashboard/history", icon: History },
    { name: "Transactions Log", href: "/dashboard/transactions", icon: Receipt },
    { name: "Email Logs", href: "/dashboard/emails", icon: Mail },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <aside className="w-64 bg-[#0f172a] text-white flex flex-col h-screen fixed left-0 top-0 z-50 overflow-y-auto">
            {/* Brand */}
            <div className="p-6">
                <div className="flex items-center space-x-2">
                    <AlertCircle className="w-6 h-6 text-blue-500" />
                    <div>
                        <h1 className="text-lg font-bold leading-tight">Admin Panel</h1>
                        <p className="text-xs text-slate-400">Super Administrator</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User & Logout */}
            <div className="p-4 border-t border-slate-800">
                <div className="text-xs text-slate-400 mb-2 truncate">
                    {user?.email || "admin@aadigitalproduct.com"}
                </div>
                <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
