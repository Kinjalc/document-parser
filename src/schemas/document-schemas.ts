import { z } from 'zod';
import { DocumentType } from '../types';

export const VisitNoteSchema = z.object({
  date: z.string().describe("The date of the visit or start date of the encounter in YYYY-MM-DD dateString format"),
  provider: z.string().describe("The name of the healthcare provider, practitioner, clinician, doctor, nurse or specialist"),
  notes: z.string().describe("Add patient's chief complaint, assessment, plan, history and additional notes"),
  status: z.enum(['planned', 'arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'cancelled']).describe("The status of the encounter"),
});

export const LabResultSchema = z.object({
  date: z.string().describe("The date of the lab test when it was performed or samples were collected in YYYY-MM-DD format"),
  issued: z.string().describe("The date of when the report was issued in YYYY-MM-DD format"),
  orderingProvider: z.string().describe("The name of the healthcare provider, practitioner, clinician, doctor, nurse or specialist who ordered the test"),
  status: z.enum(['registered', 'preliminary', 'final', 'amended', 'corrected', 'appended', 'cancelled', 'entered-in-error', 'unknown']).describe("The status of the diagnostic report"),
  code: z.string().describe("The name or code for the panel of lab tests"),
  results: z.array(z.object({
    testName: z.string().describe("Name of the biomarker or test"),
    value: z.number().describe("The numeric value of the test result"),
    unit: z.string().describe("The unit of measurement"),
    referenceRange: z.string().describe("The normal reference range"),
    interpretation: z.string().describe("Interpretation of the result (normal, high, low, etc.)"),
    status: z.enum(['registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error', 'unknown']).describe("The status of the observation")
  })),
  conclusion: z.string().describe("The final conclusion of the lab report")
});

export const ClassificationResponse = z.object({
  documentType: z.nativeEnum(DocumentType)
}); 