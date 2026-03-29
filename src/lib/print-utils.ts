/**
 * Utility for printing PDFs using a hidden iframe to simulate Ctrl+P experience
 */
export async function printPdfFromUrl(url: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch PDF");

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = blobUrl;
    document.body.appendChild(iframe);

    return new Promise((resolve) => {
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

          // Cleanup after potential print dialog closure
          setTimeout(() => {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(blobUrl);
            resolve();
          }, 1000);
        }, 500);
      };
    });
  } catch (error) {
    console.error("Print PDF failed:", error);
    throw error;
  }
}
