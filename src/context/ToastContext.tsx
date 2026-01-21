"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, AlertCircle, X, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => removeToast(id), 5000);
    }, [removeToast]);

    const success = (msg: string) => showToast(msg, "success");
    const error = (msg: string) => showToast(msg, "error");
    const info = (msg: string) => showToast(msg, "info");

    return (
        <ToastContext.Provider value={{ showToast, success, error, info }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-start w-80 p-4 rounded-xl shadow-lg border transform transition-all duration-300 animate-in slide-in-from-right-full fade-in
                            ${toast.type === "success" ? "bg-white border-green-100" :
                                toast.type === "error" ? "bg-white border-red-100" : "bg-white border-blue-100"}`}
                    >
                        <div className="flex-shrink-0">
                            {toast.type === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
                            {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                            {toast.type === "info" && <Info className="w-5 h-5 text-blue-500" />}
                        </div>
                        <div className="ml-3 w-0 flex-1 pt-0.5">
                            <p className="text-sm font-medium text-gray-900">{toast.message}</p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <span className="sr-only">Close</span>
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
