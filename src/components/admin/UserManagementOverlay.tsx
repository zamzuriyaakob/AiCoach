import { useState, useEffect } from "react";
import { X, Save, CreditCard, User, History } from "lucide-react";

interface UserData {
    id: string;
    email: string;
    account_type: "standard" | "pro" | "exclusive";
    credit_balance: number;
    assigned_provider: string;
    createdAt?: string;
    lastLogin?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    user: UserData | null;
    onSave: (uid: string, data: Partial<UserData>) => Promise<void>;
}

export default function UserManagementOverlay({ isOpen, onClose, user, onSave }: Props) {
    const [activeTab, setActiveTab] = useState<"profile" | "credits">("profile");
    const [loading, setLoading] = useState(false);

    // Form State
    const [accountType, setAccountType] = useState<string>("standard");
    const [creditBalance, setCreditBalance] = useState<number>(0);
    const [newCreditAmount, setNewCreditAmount] = useState<string>("");

    useEffect(() => {
        if (user) {
            setAccountType(user.account_type || "standard");
            setCreditBalance(user.credit_balance || 0);
            setNewCreditAmount((user.credit_balance || 0).toString());
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave(user.id, {
                account_type: accountType as any,
                credit_balance: Number(newCreditAmount)
            });
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to update user.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-100">
                    <div>
                        <div className="flex items-center space-x-2">
                            <User className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-bold text-gray-900">Manage User</h2>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-6">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors mr-6 ${activeTab === "profile"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Profile & Settings
                    </button>
                    <button
                        onClick={() => setActiveTab("credits")}
                        className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "credits"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Credits & Plan
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 min-h-[300px]">
                    {activeTab === "profile" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">User ID</label>
                                    <div className="text-sm font-mono text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-100">{user.id}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Registered</label>
                                    <div className="text-sm text-gray-700 p-2.5">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
                                <select
                                    value={accountType}
                                    onChange={(e) => setAccountType(e.target.value)}
                                    className="block w-full px-4 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-white shadow-sm"
                                >
                                    <option value="standard">Standard (Default)</option>
                                    <option value="pro">Pro</option>
                                    <option value="exclusive">Exclusive / System (Unlimited)</option>
                                </select>
                                <p className="mt-2 text-xs text-gray-500">
                                    "Exclusive" accounts bypass credit checks and have unlimited usage (e.g., for internal widgets).
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                <select className="block w-full px-4 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-white shadow-sm" disabled>
                                    <option>Active</option>
                                    <option>Suspended</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === "credits" && (
                        <div className="space-y-8">
                            <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-100">
                                <p className="text-sm text-blue-600 font-semibold mb-1 uppercase tracking-wider">Current Balance</p>
                                <h3 className="text-4xl font-bold text-blue-900">{creditBalance}</h3>
                                <p className="text-xs text-blue-400 mt-2">Credits</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Update Credit Balance (Set New Amount)</label>
                                <div className="flex gap-4">
                                    <input
                                        type="number"
                                        value={newCreditAmount}
                                        onChange={(e) => setNewCreditAmount(e.target.value)}
                                        className="block w-full px-4 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border shadow-sm"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    This will directly set the user's balance to the specified amount.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
