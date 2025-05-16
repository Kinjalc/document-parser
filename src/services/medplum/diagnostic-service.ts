import { DiagnosticReport, Observation } from '@medplum/fhirtypes';
import { BaseMedplumService } from './base-service';
import { MedplumPractitionerService } from './practitioner-service';
import { LabResultSchema } from '../../schemas/document-schemas';
import { z } from 'zod';

export class DiagnosticService extends BaseMedplumService {
  private readonly defaultPractitionerId: string;
  private readonly practitionerService: MedplumPractitionerService;

  constructor() {
    super();
    this.defaultPractitionerId = process.env.PRACTITIONER_ID || '';
    this.practitionerService = new MedplumPractitionerService();
    
    if (!this.defaultPractitionerId) {
      console.warn('PRACTITIONER_ID not found in environment variables');
    }
  }

  async createDiagnosticReportResource(parsedLab: z.infer<typeof LabResultSchema>, patientId: string): Promise<void> {
    let practitionerId: string;
    
    if (parsedLab.orderingProvider && parsedLab.orderingProvider !== '<UNKNOWN>') {
      const practitioner = await this.practitionerService.findOrCreatePractitioner(parsedLab.orderingProvider);
      practitionerId = practitioner.id;
    } else {
      practitionerId = this.defaultPractitionerId;
    }

    try {
      // Create Observation resources for each lab result first
      const observationIds: string[] = [];
      
      for (const result of parsedLab.results) {
        const observation = await this.createObservationResource(result, parsedLab, patientId, practitionerId);
        observationIds.push(observation.id!);
      }

      // Create the DiagnosticReport with references to the created Observations
      await this.createDiagnosticReport(parsedLab, patientId, observationIds, practitionerId);
    } catch (error) {
      console.error('Error creating DiagnosticReport:', error);
      throw error;
    }
  }

  private async createObservationResource(
    result: z.infer<typeof LabResultSchema>['results'][0],
    parsedLab: z.infer<typeof LabResultSchema>,
    patientId: string,
    practitionerId: string
  ): Promise<Observation> {
    const observation = await this.medplum.createResource({
      resourceType: "Observation",
      status: result.status,
      subject: {
        reference: `Patient/${patientId}`,
      },
      effectiveDateTime: this.formatDateToISO(parsedLab.date),
      issued: this.formatDateToISO(parsedLab.issued),
      code: {
        text: result.testName,
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
    });

    console.log('Created Observation:', observation.id);
    return observation;
  }

  private async createDiagnosticReport(
    parsedLab: z.infer<typeof LabResultSchema>,
    patientId: string,
    observationIds: string[],
    practitionerId: string
  ): Promise<DiagnosticReport> {
    const diagnosticReport = await this.medplum.createResource({
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
      resultsInterpreter: [
        {
          reference: `Practitioner/${practitionerId}`,
        },
      ],
      effectiveDateTime: this.formatDateToISO(parsedLab.date),
      issued: this.formatDateToISO(parsedLab.issued),
      result: observationIds.map(id => ({
        reference: `Observation/${id}`
      })),
      conclusion: parsedLab.conclusion
    });
    //practitioner reference can be found in the diagnosticReport.resultsInterpreter[0].reference
    console.log('Created DiagnosticReport id:', diagnosticReport.id);
    return diagnosticReport;
  }
} 