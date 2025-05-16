import { Encounter } from '@medplum/fhirtypes';
import { BaseMedplumService } from './base-service';
import { MedplumPractitionerService } from './practitioner-service';
import { VisitNoteSchema } from '../../schemas/document-schemas';
import { z } from 'zod';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

export class EncounterService extends BaseMedplumService {
  private readonly defaultPractitionerId: string = process.env.PRACTITIONER_ID || '';
  private readonly practitionerService: MedplumPractitionerService = new MedplumPractitionerService();

  constructor() {
    super();
    if (!this.defaultPractitionerId) {
      console.warn('DEFAULT_PRACTITIONER_ID not found in environment variables');
    }
  }

  async createEncounterResource(parsedVisit: z.infer<typeof VisitNoteSchema>, patientId: string): Promise<void> {
    let practitionerId: string;
    
    if ((parsedVisit.provider && parsedVisit.provider !== '<UNKNOWN>')) {
      const practitioner = await this.practitionerService.findOrCreatePractitioner(parsedVisit.provider);
      practitionerId = practitioner.id;
    } else {
      practitionerId = this.defaultPractitionerId;
    }

    try {
      const encounter = await this.medplum.createResource({
        resourceType: 'Encounter',
        status: parsedVisit.status,
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'AMB',
          display: 'ambulatory',
        },
        subject: {
          reference: `Patient/${patientId}`,
        },
        participant: [
          {
            type: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'PPRF',
                    display: 'primary performer',
                  },
                ],
              },
            ],
            individual: {
              reference: `Practitioner/${practitionerId}`,
            },
          },
        ],
        period: {
          start: this.formatDateToISO(parsedVisit.date),
          end: this.formatDateToISO(parsedVisit.date),
        },
        reasonCode: [
          {
            text: parsedVisit.notes,
          },
        ],
      });
      //practitioner reference can be found in the encounter.participant[0].individual.reference
      console.log('Created Encounter id:', encounter.id);
    } catch (error) {
      console.error('Error creating Encounter:', error);
      throw error;
    }
  }
} 