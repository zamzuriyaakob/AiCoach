import { adminDb } from "@/lib/firebaseAdmin";

export interface GlobalSettings {
    defaultProvider: "DeepSeek" | "OpenAI" | "Together";
    internalWidgetProvider: "DeepSeek" | "OpenAI" | "Together";
}

const SETTINGS_COLLECTION = "aicoach_settings";
const GLOBAL_DOC_ID = "global";

export const getGlobalSettings = async (): Promise<GlobalSettings> => {
    try {
        const doc = await adminDb.collection(SETTINGS_COLLECTION).doc(GLOBAL_DOC_ID).get();
        if (doc.exists) {
            return doc.data() as GlobalSettings;
        }
        // Default values if not set
        return {
            defaultProvider: "DeepSeek",
            internalWidgetProvider: "DeepSeek",
        };
    } catch (error) {
        console.error("Error fetching global settings:", error);
        return {
            defaultProvider: "DeepSeek",
            internalWidgetProvider: "DeepSeek",
        };
    }
};

export const updateGlobalSettings = async (settings: Partial<GlobalSettings>) => {
    try {
        await adminDb.collection(SETTINGS_COLLECTION).doc(GLOBAL_DOC_ID).set(settings, { merge: true });
        return true;
    } catch (error) {
        console.error("Error updating global settings:", error);
        throw error;
    }
};
