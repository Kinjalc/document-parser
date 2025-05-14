import { MedplumClient } from '@medplum/core';
import { z } from 'zod';
import { VisitNoteSchema, LabResultSchema } from '../schemas/document-schemas';
import { Encounter, Observation, DiagnosticReport } from '@medplum/fhirtypes';

// Some of the fields like "code" are hardcoded to match the FHIR standard based on the provided pdfs. These are required fields. 
// Ideally, we should decide the code system we would like to pick from and use that (Either have it in our database or provide the info to LLM
export class MedplumService {
  private client: MedplumClient;

  constructor() {
    this.client = new MedplumClient({
      clientId: process.env.MEDPLUM_CLIENT_ID!,
      clientSecret: process.env.MEDPLUM_CLIENT_SECRET!,
    });
  }

  // Helper function to format date to ISO 8601
  private formatDateToISO(dateStr: string): string {
    return `${dateStr}T00:00:00Z`;
  }

  async createEncounterResource(parsedNote: z.infer<typeof VisitNoteSchema>, patientId: string): Promise<void> {
    try {
      const encounterData: Encounter = {
        resourceType: "Encounter",
        status: parsedNote.status,
        class: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "AMB",
          display: "ambulatory"
        },
        subject: {
          reference: `Patient/${patientId}`
        },
        period: {
          start: this.formatDateToISO(parsedNote.date),
        },
        reasonCode: [
          {
            text: parsedNote.notes
          }
        ],
        serviceProvider: {
          reference: "Organization/your-organization-id"
        }
      };

      const createdEncounter = await this.client.createResource(encounterData);
      console.log('Created Encounter with id:', createdEncounter.id);
    } catch (error) {
      console.error('Error creating Encounter:', error);
      throw error;
    }
  }

  async createDiagnosticReportResource(parsedLab: z.infer<typeof LabResultSchema>, patientId: string): Promise<void> {
    try {
      // Create Observation resources for each lab result first
      const observationIds: string[] = [];
      
      for (const result of parsedLab.results) {
        const observationData: Observation = {
          resourceType: "Observation",
          status: result.status,
          subject: {
            reference: `Patient/${patientId}`,
          },
          effectiveDateTime: this.formatDateToISO(parsedLab.date),
          issued: this.formatDateToISO(parsedLab.issued),
          code: {
            text: result.testName
          },
          valueQuantity: {
            value: result.value,
            unit: result.unit
          },
          referenceRange: [{
            text: result.referenceRange
          }],
          interpretation: [{
            text: result.interpretation
          }],
        };

        const observation = await this.client.createResource(observationData);
        observationIds.push(observation.id!);
        console.log('Created Observation with id:', observation.id);
      }

      // Create the DiagnosticReport with references to the created Observations
      const diagnosticReportData: DiagnosticReport = {
        resourceType: "DiagnosticReport",
        status: parsedLab.status,
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v2-0074",
                code: "LAB",
                display: "Laboratory"
              }
            ]
          }
        ],
        code: {
          text: parsedLab.code
        },
        subject: {
          reference: `Patient/${patientId}`
        },
        effectiveDateTime: this.formatDateToISO(parsedLab.date),
        issued: this.formatDateToISO(parsedLab.issued),
        performer: [
          {
            reference: `Practitioner/${parsedLab.orderingProvider}`
          }
        ],
        result: observationIds.map(id => ({
          reference: `Observation/${id}`
        })),
        conclusion: parsedLab.conclusion
      };

      const diagnosticReport = await this.client.createResource(diagnosticReportData);
      console.log('Created Diagnostic Report with id:', diagnosticReport.id);
    } catch (error) {
      console.error('Error creating Diagnostic Report:', error);
      throw error;
    }
  }
} 