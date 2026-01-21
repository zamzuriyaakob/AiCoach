"use client";

import { useState, useEffect } from "react";
import { Check, Zap, CreditCard, Loader2 } from "lucide-react";
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

export default function UpgradePage() {
    const { user } = useAuth();
    const { success, error: showError, info } = useToast();
    const [packages, setPackages] = useState<SystemPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [purchasingId, setPurchasingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchPackages = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const res = await fetch("/api/packages/list", {
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
        fetchPackages();
    }, [user]);

    const handlePurchase = async (pkg: SystemPackage) => {
        if (!user) return;
        if (!confirm(`Confirm purchase of ${pkg.name} for RM ${pkg.price}?`)) return;

        setPurchasingId(pkg.id);
        info("Processing purchase...");

        try {
            const token = await user.getIdToken();
            const res = await fetch("/api/user/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ packageId: pkg.id })
            });

            if (res.ok) {
                const data = await res.json();
                success(`Successfully added ${data.creditsAdded} credits!`);
                // Ideally refresh user context here to show new balance immediately
                // For now, page refresh or context update mechanism needed.
                // Assuming AuthContext or Dashboard fetches user data periodically or on nav.
                setTimeout(() => window.location.reload(), 1500); // Simple reload to refresh balance in sidebar
            } else {
                showError("Purchase failed. Please try again.");
            }
        } catch (err) {
            console.error(err);
            showError("An error occurred");
        } finally {
            setPurchasingId(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Upgrade Your Plan</h1>
                <p className="text-gray-500">Choose a package to top up your AI credits and unlock more potential.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col relative">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{pkg.name}</h3>
                                <div className="flex items-baseline mb-2">
                                    <span className="text-3xl font-extrabold text-blue-600">RM {pkg.price}</span>
                                    <span className="text-xs text-gray-500 ml-1">/ one-time</span>
                                </div>
                                <p className="text-sm text-gray-500">{pkg.description} includes <span className="font-bold text-gray-700">{pkg.credits} Credits</span></p>
                            </div>

                            {/* Features */}
                            <div className="p-6 flex-grow">
                                <ul className="space-y-4">
                                    {(pkg.features || []).map((feat, i) => (
                                        <li key={i} className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <Check className="h-5 w-5 text-green-500" />
                                            </div>
                                            <p className="ml-3 text-sm text-gray-600">{feat}</p>
                                        </li>
                                    ))}
                                    {/* Default feature */}
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <Zap className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <p className="ml-3 text-sm text-gray-600">Instant Credit Activation</p>
                                    </li>
                                </ul>
                            </div>

                            {/* Action */}
                            <div className="p-6 pt-0 mt-auto">
                                <button
                                    onClick={() => handlePurchase(pkg)}
                                    disabled={purchasingId !== null}
                                    className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white transition-all
                                        ${purchasingId === pkg.id
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"}`}
                                >
                                    {purchasingId === pkg.id ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-4 h-4 mr-2" />
                                            Buy Now
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
