import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import jsPDF from "jspdf";

export const saveAndOpenPDF = async (doc: jsPDF, fileName: string) => {
    // 1. IF WEB: Just download normally
    if (!Capacitor.isNativePlatform()) {
        doc.save(fileName);
        return;
    }

    // 2. IF MOBILE (Android/iOS): Write file & Share
    try {
        // Get the PDF as a Base64 string
        const base64Data = doc.output("datauristring").split(",")[1];

        // CHANGE 1: Use 'Cache' instead of 'Documents' (Works on all Android versions)
        const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache,
        });

        // CHANGE 2: Share the file (User can choose "Save to Drive" or "WhatsApp" from here)
        await Share.share({
            title: "Open Financial Report",
            text: "Here is your SpendControl statement.",
            url: savedFile.uri,
            dialogTitle: "Save or Send PDF",
        });

    } catch (error) {
        console.error("Error saving PDF:", error);
        alert("Could not save file on device. Check permissions.");
    }
};
