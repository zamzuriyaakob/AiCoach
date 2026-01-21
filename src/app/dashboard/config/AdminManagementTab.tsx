"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Power, Loader2 } from "lucide-react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function AdminManagementTab() {
    const { user } = useAuth();
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [newEmail, setNewEmail] = useState("");
    const [newRole, setNewRole] = useState("user_admin");
    const [newPassword, setNewPassword] = useState("WebKilat123!"); // Default as per screenshot hint

    useEffect(() => {
        const q = query(collection(db, "aicoach_admins"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const adminList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAdmins(adminList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAddAdmin = async () => {
        if (!newEmail) return;
        setIsAdding(true);

        try {
            const res = await fetch("/api/admin/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: newEmail,
                    password: newPassword,
                    role: newRole,
                    createdBy: user?.email || "system"
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Reset form
            setNewEmail("");
            setNewPassword("WebKilat123!");
            alert("Admin added successfully!");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (email: string) => {
        if (!confirm(`Are you sure you want to delete ${email}?`)) return;
        // Ideally call an API to remove from Auth too, but for now remove from DB
        try {
            await deleteDoc(doc(db, "aicoach_admins", email));
        } catch (error) {
            console.error("Error deleting", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Add New Admin Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Add New Admin</h3>

                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Enter email address"
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
                        <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="user_admin">User Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>
                    <div className="w-full md:w-48">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Pass (Pre-set)</label>
                        <input
                            type="text"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                        />
                    </div>
                    <button
                        onClick={handleAddAdmin}
                        disabled={isAdding}
                        className="flex items-center justify-center px-6 py-2.5 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Add Admin</>}
                    </button>
                </div>
            </div>

            {/* Admin List Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Admin User</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Added Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Password</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {admins.map((admin) => (
                                <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                                                {(admin.email || "?").charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-gray-900">{admin.email}</div>
                                                <div className="text-xs text-gray-500">Added by {admin.createdBy}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${admin.role === "super_admin"
                                            ? "bg-purple-100 text-purple-800"
                                            : "bg-blue-100 text-blue-800"
                                            }`}>
                                            {admin.role === "super_admin" ? "Super Admin" : "User Admin"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${admin.isActive
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-800"
                                            }`}>
                                            {admin.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {admin.createdAt
                                            ? (admin.createdAt.seconds
                                                ? new Date(admin.createdAt.seconds * 1000).toLocaleDateString()
                                                : new Date(admin.createdAt).toLocaleDateString())
                                            : "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                                                {admin.password}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        {admin.email === user?.email ? (
                                            <span className="text-gray-400 text-xs italic">Current User</span>
                                        ) : (
                                            <div className="flex items-center justify-end space-x-3">
                                                <button
                                                    onClick={() => handleDelete(admin.email)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {admins.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">
                                        No admins found. Add one above.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
