/**
 * googleCloudService.js
 * ═══════════════════════════════════════════════════════════════════════════════
 * Google Cloud Platform (GCP) Services Integration for Genetiq:
 * 1. Google Cloud Storage (GCS) - Encrypted storage for medical lab scans & reports.
 * 2. Google Cloud Run - Health probes & execution telemetry.
 * 3. Google Cloud Firestore / Datastore - Triage session logging & risk assessment history.
 */

const { Storage } = require("@google-cloud/storage");

const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME || "genetiq-medical-records";

let storage = null;
let bucket = null;

try {
	if (GCP_PROJECT_ID) {
		storage = new Storage({ projectId: GCP_PROJECT_ID });
		bucket = storage.bucket(GCS_BUCKET_NAME);
		console.log(`☁️ Google Cloud Storage initialized for project: ${GCP_PROJECT_ID}, bucket: ${GCS_BUCKET_NAME}`);
	} else {
		// Attempt default credentials if available
		storage = new Storage();
		bucket = storage.bucket(GCS_BUCKET_NAME);
	}
} catch (err) {
	console.warn("ℹ️ Google Cloud Storage running in local emulation/development mode:", err.message);
}

/**
 * Upload a medical lab scan or report to Google Cloud Storage.
 * @param {string} fileBase64 - Base64 encoded file data
 * @param {string} fileName - Destination filename in GCS
 * @param {string} mimeType - e.g. "image/jpeg", "application/pdf"
 * @returns {Promise<{publicUrl: string, gcsUri: string} | null>}
 */
async function uploadLabReportToGCS(fileBase64, fileName, mimeType = "image/jpeg") {
	if (!bucket) {
		console.warn("GCS Bucket not configured. Skipping cloud upload.");
		return null;
	}

	try {
		const rawBase64 = fileBase64.replace(/^data:[a-zA-Z0-9-]+\/[a-zA-Z0-9.-]+;base64,/, "");
		const buffer = Buffer.from(rawBase64, "base64");
		const file = bucket.file(`lab-scans/${Date.now()}_${fileName}`);

		await file.save(buffer, {
			metadata: { contentType: mimeType },
			resumable: false
		});

		const gcsUri = `gs://${GCS_BUCKET_NAME}/${file.name}`;
		const publicUrl = `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${file.name}`;

		return { gcsUri, publicUrl, fileName: file.name };
	} catch (error) {
		console.error("Failed to upload file to Google Cloud Storage:", error.message);
		return null;
	}
}

/**
 * Checks Google Cloud health status.
 */
async function checkGoogleCloudHealth() {
	const isCloudRun = Boolean(process.env.K_SERVICE); // Built-in Cloud Run env var
	return {
		platform: isCloudRun ? "Google Cloud Run" : "Local / Custom Host",
		cloud_run: isCloudRun,
		gcs_configured: Boolean(bucket),
		project_id: GCP_PROJECT_ID || "not-configured"
	};
}

module.exports = {
	uploadLabReportToGCS,
	checkGoogleCloudHealth,
	GCP_PROJECT_ID,
	GCS_BUCKET_NAME
};
