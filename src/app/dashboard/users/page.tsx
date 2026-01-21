"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Loader2, ArrowUpDown, MoreHorizontal, Shield, Zap } from "lucide-react";
import UserManagementOverlay from "@/components/admin/UserManagementOverlay";

interface User {
    id: string;
    email: string;
    account_type: "standard" | "pro" | "exclusive";
    credit_balance: number;
    assigned_provider: string;
    createdAt?: string;
    role?: string;
}

export default function UserManagementPage() {
    const { user: authUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Overlay State
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);

    const fetchUsers = async () => {
        if (!authUser) return;
        try {
            setLoading(true);
            const token = await authUser.getIdToken();
            const res = await fetch("/api/admin/users/list", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [authUser]);

    const handleOpenOverlay = (user: User) => {
        setSelectedUser(user);
        setIsOverlayOpen(true);
    };

    const handleSaveUser = async (uid: string, updates: Partial<User>) => {
        if (!authUser) return;
        try {
            const token = await authUser.getIdToken();
            const res = await fetch("/api/admin/users/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ uid, ...updates })
            });

            if (!res.ok) throw new Error("Failed to update");

            // Refresh list
            await fetchUsers();

        } catch (error) {
            console.error(error);
            throw error; // Re-throw for overlay to handle ui state if needed
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <button
                    onClick={fetchUsers}
                    className="flex items-center px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Refresh List
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search users by email or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status & Plan</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Credits</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Provider</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{user.email}</div>
                                            <div className="text-xs text-gray-400 font-mono mt-0.5 max-w-[150px] truncate" title={user.id}>ID: {user.id}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-start space-y-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide
                                                ${user.account_type === 'exclusive' ? 'bg-purple-100 text-purple-700' :
                                                    user.account_type === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {user.account_type === 'exclusive' && <Shield className="w-3 h-3 mr-1" />}
                                                {user.account_type || 'FREE TIER'}
                                            </span>
                                            <span className="text-xs text-green-600 flex items-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></div>
                                                Active
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <span className="text-lg font-bold text-gray-900 mr-2">{user.credit_balance || 0}</span>
                                            <span className="text-xs text-gray-500 font-medium">WK</span>
                                        </div>
                                        {user.account_type === 'exclusive' && (
                                            <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-1.5 py-0.5 rounded">Unlimited</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600 border border-gray-200 px-2 py-1 rounded bg-gray-50">
                                            {user.assigned_provider || "Default"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleOpenOverlay(user)}
                                                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                                            >
                                                Details
                                            </button>
                                            <button
                                                onClick={() => handleOpenOverlay(user)} // Same overlay, maybe pre-select tab?
                                                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-sm"
                                            >
                                                Upgrade Pro
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {loading && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            Loading users...
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No users found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Overlay */}
            <UserManagementOverlay
                isOpen={isOverlayOpen}
                onClose={() => setIsOverlayOpen(false)}
                user={selectedUser}
                onSave={handleSaveUser}
            />
        </div>
    );
}
