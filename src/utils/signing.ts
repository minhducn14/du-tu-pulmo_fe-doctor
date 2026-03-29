/**
 * FE - Utility for Medical Record Digital Signing (MVP)
 * Uses Web Crypto API for SHA-256 hashing.
 */

import type { MedicalRecord, Prescription, VitalSign } from "@/types/medical";

/**
 * Helper to stringify an object with stable property ordering.
 */
function stableStringify(obj: any): string {
    if (obj === null || typeof obj !== 'object') {
        return JSON.stringify(obj);
    }

    if (Array.isArray(obj)) {
        return '[' + obj.map(stableStringify).join(',') + ']';
    }

    const sortedKeys = Object.keys(obj).sort();
    const result = '{' + sortedKeys
        .map(key => `${JSON.stringify(key)}:${stableStringify(obj[key])}`)
        .join(',') + '}';
    
    return result;
}

/**
 * Computes a stable SHA-256 hash of the medical record content.
 * Follows the V3 specification (Admin + Clinical + Vitals + Prescriptions).
 */
export async function computeRecordHash(
  record: MedicalRecord,
  prescriptions: Prescription[],
  latestVitals: VitalSign | null,
): Promise<string> {
  const dataToHash = {
    id: record.id,

    // Clinical Info
    clinical: {
      chiefComplaint: record.chiefComplaint || "",
      presentIllness: record.presentIllness || "",
      physicalExamNotes: record.physicalExamNotes || "",
      systemsReview: record.systemsReview || "",
      fullRecordSummary: record.fullRecordSummary || "",
      diagnosis: record.diagnosis || "",
      secondaryDiagnosis: record.secondaryDiagnosis || "",
      treatmentGiven: record.treatmentGiven || "",
      treatmentPlan: record.treatmentPlan || "",
      primaryDiagnosis: record.primaryDiagnosis || "",
      dischargeCondition: record.dischargeCondition || "",
      followUpInstructions: record.followUpInstructions || "",
    },

    // History & Lifestyle (Sorted arrays)
    history: {
      medicalHistory: record.medicalHistory || "",
      surgicalHistory: record.surgicalHistory || "",
      familyHistory: record.familyHistory || "",
      smokingStatus: !!record.smokingStatus,
      smokingYears: Number(record.smokingYears || 0),
      alcoholConsumption: !!record.alcoholConsumption,
      allergies: [...(record.allergies || [])].sort(),
      chronicDiseases: [...(record.chronicDiseases || [])].sort(),
      currentMedications: [...(record.currentMedications || [])].sort(),
    },

    // Latest Vital Signs
    vitals: latestVitals
      ? {
          weight: latestVitals.weight != null ? Number(latestVitals.weight) : null,
          height: latestVitals.height != null ? Number(latestVitals.height) : null,
          temperature: latestVitals.temperature != null ? Number(latestVitals.temperature) : null,
          bloodPressure: latestVitals.bloodPressure || "",
          heartRate: latestVitals.heartRate != null ? Number(latestVitals.heartRate) : null,
          respiratoryRate: latestVitals.respiratoryRate != null ? Number(latestVitals.respiratoryRate) : null,
          spo2: latestVitals.spo2 != null ? Number(latestVitals.spo2) : null,
        }
      : null,

    // Prescriptions (Sorted by prescriptionNumber)
    prescriptions: [...(prescriptions || [])]
      .sort((a, b) =>
        (a.prescriptionNumber || "").localeCompare(b.prescriptionNumber || ""),
      )
      .map((p) => ({
        prescriptionNumber: p.prescriptionNumber || "",
        notes: p.notes || "",
        // Items sorted by medicineName
        items: [...(p.items || [])]
          .sort((a, b) =>
            (a.medicineName || "").localeCompare(b.medicineName || ""),
          )
          .map((it) => ({
            medicineName: it.medicineName || "",
            quantity: Number(it.quantity || 0),
            unit: it.unit || "",
            dosage: it.dosage || "",
            frequency: it.frequency || "",
            instructions: it.instructions || "",
          })),
      })),
  };

  const jsonString = stableStringify(dataToHash);
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}
