"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Check, Package, X, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface SystemPackage {
    id: string;
    name: string;
    description: string;
    price: number;
    credits: number;
    features: string[];
}

export default function SystemPackagesTab() {
    const { user } = useAuth();
    const { success, error: showError } = useToast();
    const [packages, setPackages] = useState<SystemPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPkg, setEditingPkg] = useState<SystemPackage | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: 0,
        credits: 0,
        features: "" // multiline string
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchPackages();
    }, [user]);

    const fetchPackages = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch("/api/admin/packages/list", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPackages(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (pkg?: SystemPackage) => {
        if (pkg) {
            setEditingPkg(pkg);
            setFormData({
                name: pkg.name,
                description: pkg.description,
                price: pkg.price,
                credits: pkg.credits,
                features: pkg.features ? pkg.features.join("\n") : ""
            });
        } else {
            setEditingPkg(null);
            setFormData({
                name: "",
                description: "",
                price: 0,
                credits: 0,
                features: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);
        try {
            const token = await user.getIdToken();
            const payload = {
                id: editingPkg?.id,
                ...formData,
                features: formData.features.split("\n").filter(f => f.trim() !== "")
            };

            const res = await fetch("/api/admin/packages/manage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                success(editingPkg ? "Package updated!" : "Package created!");
                setIsModalOpen(false);
                fetchPackages();
            } else {
                showError("Failed to save package");
            }

        } catch (err) {
            console.error(err);
            showError("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this package?")) return;
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`/api/admin/packages/manage?id=${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                success("Package deleted");
                fetchPackages();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">System Packages</h2>
                    <p className="text-gray-500 text-sm">Define credit packages for purchase associated with 'aicoach_packages'</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Package
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : packages.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No packages defined yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{pkg.name}</h3>
                                    <p className="text-xs text-gray-500">{pkg.description}</p>
                                </div>
                                <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                    {pkg.credits} Credits
                                </div>
                            </div>

                            <div className="mb-6 flex-grow">
                                <ul className="space-y-2">
                                    {(pkg.features || []).map((feat, i) => (
                                        <li key={i} className="flex items-start text-sm text-gray-600">
                                            <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                                <span className="text-2xl font-bold text-gray-900">RM {pkg.price}</span>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleOpenModal(pkg)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(pkg.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">
                                {editingPkg ? "Edit Package" : "Create New Package"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Package Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Starter Pack"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Short summary"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price (RM)</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Credits</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.credits}
                                        onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Features (One per line)</label>
                                <textarea
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Access to GPT-4&#10;Priority Support"
                                    value={formData.features}
                                    onChange={e => setFormData({ ...formData, features: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isSaving ? "Saving..." : "Save Package"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
