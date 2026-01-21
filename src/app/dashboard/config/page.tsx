"use client";

import { useState, useEffect } from "react";
import { Save, Activity, CheckCircle, Database, CreditCard, Bell, Quote, Users, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AdminManagementTab from "./AdminManagementTab";
import SystemPackagesTab from "./SystemPackagesTab";

const tabs = [
    { name: "AI Provider Config", icon: Database, active: true },
    { name: "Admin Management", icon: Users, active: false },
    { name: "Insight Quotes", icon: Quote, active: false },
    { name: "Announcements", icon: Bell, active: false },
    { name: "System Packages", icon: Database, active: false },
    { name: "Global Settings", icon: Settings, active: false },
];

export default function ConfigPage() {
    const { user } = useAuth(); // Get user for auth token if needed, or just rely on cookie if backend handles it? 
    // The API route I wrote uses `Bearer token`. So I need to get the token.
    // user.getIdToken() is typical.

    const [defaultUserProvider, setDefaultUserProvider] = useState("DeepSeek");
    const [internalWidgetProvider, setInternalWidgetProvider] = useState("DeepSeek");
    const [isSaving, setIsSaving] = useState(false);

    const [activeTab, setActiveTab] = useState("AI Provider Config");

    useEffect(() => {
        const fetchSettings = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const res = await fetch("/api/admin/settings", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.defaultProvider) setDefaultUserProvider(data.defaultProvider);
                    if (data.internalWidgetProvider) setInternalWidgetProvider(data.internalWidgetProvider);
                }
            } catch (err) {
                console.error("Failed to fetch settings", err);
            }
        };
        fetchSettings();
    }, [user]);

    const handleSaveSettings = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const token = await user.getIdToken();
            await fetch("/api/admin/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    defaultProvider: defaultUserProvider,
                    internalWidgetProvider: internalWidgetProvider
                })
            });
            alert("Settings saved successfully!");
        } catch (err) {
            console.error("Failed to save settings", err);
            alert("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    const [analytics, setAnalytics] = useState<any>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const res = await fetch("/api/admin/analytics", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAnalytics(data);
                }
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            }
        };

        if (activeTab === "AI Provider Config") {
            fetchAnalytics();
        }
    }, [user, activeTab]);

    // Helper to format success rate
    const getSuccessRate = (reqs: number, errs: number) => {
        if (!reqs) return { text: "0% Success", color: "bg-gray-100 text-gray-800" };
        const rate = Math.round(((reqs - errs) / reqs) * 100);
        return {
            text: `${rate}% Success`,
            color: rate >= 90 ? "bg-green-100 text-green-800" : rate >= 50 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
        };
    };

    const formatDate = (ts: number | null) => {
        if (!ts) return "Never";
        return new Date(ts).toLocaleString();
    };

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Settings className="w-6 h-6 mr-2 text-blue-600" />
                    Admin Configuration
                </h1>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 overflow-x-auto border-b border-gray-200 mb-8 pb-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${activeTab === tab.name
                            ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        {tab.icon && <tab.icon className="w-4 h-4 mr-2" />}
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Config Content */}
            {activeTab === "AI Provider Config" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
                    <div className="grid grid-cols-1 gap-8 max-w-4xl">
                        {/* Global Settings Header */}
                        <div className="border-b border-gray-100 pb-4">
                            <h2 className="text-lg font-bold text-gray-900">Global AI Provider Settings</h2>
                            <p className="text-sm text-gray-500">Configure default behaviors for new users and system widgets.</p>
                        </div>

                        {/* Default Provider for New Users */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Default Provider for New Users</label>
                            <select
                                value={defaultUserProvider}
                                onChange={(e) => setDefaultUserProvider(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                            >
                                <option value="DeepSeek">DeepSeek</option>
                                <option value="OpenAI">OpenAI</option>
                                <option value="Together">Together AI</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                Assigned to new users upon registration. They can manually change this later if permitted.
                            </p>
                        </div>

                        {/* Internal Widget Provider */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Internal Widget Provider</label>
                            <select
                                value={internalWidgetProvider}
                                onChange={(e) => setInternalWidgetProvider(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                            >
                                <option value="DeepSeek">DeepSeek</option>
                                <option value="OpenAI">OpenAI</option>
                                <option value="Together">Together AI</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                Powers the public-facing chat widget on the AiCoach website (Bypasses user credits).
                            </p>
                        </div>

                        {/* Secure Configuration Note */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start">
                            <Database className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                            <div>
                                <h3 className="text-sm font-bold text-blue-900">Secure API Configuration</h3>
                                <p className="text-xs text-blue-700 mt-1">
                                    API Keys are securely managed via server-side Environment Variables (DEEPSEEK_API_KEY, OPENAI_API_KEY, TOGETHER_API_KEY).
                                    No manual key entry is required in this panel.
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4">
                            <button
                                onClick={handleSaveSettings}
                                disabled={isSaving}
                                className={`flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            >
                                {isSaving ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Configuration
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "Admin Management" && (
                <div className="mb-8">
                    <AdminManagementTab />
                </div>
            )}

            {activeTab === "System Packages" && (
                <div className="mb-8">
                    <SystemPackagesTab />
                </div>
            )}

            {activeTab === "AI Provider Config" && (
                <>
                    {/* Analytics */}
                    <div className="mb-4 flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">AI Usage Analytics</h2>
                    </div>

                    {analytics ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* OpenAI Card */}
                            <StatsCard
                                title="OpenAI"
                                requests={analytics.openai?.requests || 0}
                                errors={analytics.openai?.errors || 0}
                                {...getSuccessRate(analytics.openai?.requests || 0, analytics.openai?.errors || 0)}
                                lastUsed={formatDate(analytics.openai?.lastUsed)}
                                usage={{
                                    in: (analytics.openai?.tokensIn || 0).toLocaleString(),
                                    out: (analytics.openai?.tokensOut || 0).toLocaleString(),
                                    total: ((analytics.openai?.tokensIn || 0) + (analytics.openai?.tokensOut || 0)).toLocaleString()
                                }}
                            />
                            {/* DeepSeek Card */}
                            <StatsCard
                                title="DeepSeek"
                                requests={analytics.deepseek?.requests || 0}
                                errors={analytics.deepseek?.errors || 0}
                                {...getSuccessRate(analytics.deepseek?.requests || 0, analytics.deepseek?.errors || 0)}
                                lastUsed={formatDate(analytics.deepseek?.lastUsed)}
                                usage={{
                                    in: (analytics.deepseek?.tokensIn || 0).toLocaleString(),
                                    out: (analytics.deepseek?.tokensOut || 0).toLocaleString(),
                                    total: ((analytics.deepseek?.tokensIn || 0) + (analytics.deepseek?.tokensOut || 0)).toLocaleString()
                                }}
                            />
                            {/* Together/Grok Card */}
                            <StatsCard
                                title="Together / Grok"
                                requests={analytics.together?.requests || 0}
                                errors={analytics.together?.errors || 0}
                                {...getSuccessRate(analytics.together?.requests || 0, analytics.together?.errors || 0)}
                                lastUsed={formatDate(analytics.together?.lastUsed)}
                                usage={{
                                    in: (analytics.together?.tokensIn || 0).toLocaleString(),
                                    out: (analytics.together?.tokensOut || 0).toLocaleString(),
                                    total: ((analytics.together?.tokensIn || 0) + (analytics.together?.tokensOut || 0)).toLocaleString()
                                }}
                            />
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                            <p className="text-gray-500">Loading analytics...</p>
                        </div>
                    )}
                </>
            )}

        </div>
    );
}

function StatsCard({ title, requests, errors, successRate, successColor, lastUsed, usage }: any) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${successColor}`}>
                    {typeof successRate === 'string' ? successRate : successRate.text}
                    {/* Handle both for compatibility during transition if needed, but we passed text keys */}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-xs text-gray-500 mb-1">Requests</p>
                    <p className="text-xl font-bold text-gray-900">{requests}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 mb-1">Errors</p>
                    <p className="text-xl font-bold text-red-600">{errors}</p>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">Token Usage</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">In:</span>
                        <span className="font-medium text-gray-900">{usage.in}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Out:</span>
                        <span className="font-medium text-gray-900">{usage.out}</span>
                    </div>
                </div>
                <div className="flex justify-between text-sm mt-1 pt-1 border-t border-dashed border-gray-100">
                    <span className="text-gray-500 font-bold">Total:</span>
                    <span className="font-bold text-gray-900">{usage.total}</span>
                </div>
            </div>

            <p className="text-[10px] text-gray-400">Last Used: {lastUsed}</p>
        </div>
    )
}
