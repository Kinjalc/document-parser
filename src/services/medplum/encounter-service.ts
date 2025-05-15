import { Encounter } from '@medplum/fhirtypes';
import { BaseMedplumService } from './base-service';
import { VisitNoteSchema } from '../../schemas/document-schemas';
import { z } from 'zod';

export class EncounterService extends BaseMedplumService {
  async createEncounterResource(parsedNote: z.infer<typeof VisitNoteSchema>, patientId: string): Promise<void> {
    try {
      const createdEncounter = await this.medplum.createResource({
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
      });

      console.log('Created Encounter:', createdEncounter.id);
    } catch (error) {
      console.error('Error creating Encounter:', error);
      throw error;
    }
  }
} 