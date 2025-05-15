import { Patient, Encounter, DiagnosticReport, Observation } from '@medplum/fhirtypes';
import { BaseMedplumService } from './base-service';

export class FhirService extends BaseMedplumService {
  async getPatientData(patientId: string): Promise<{
    patient: Patient;
    encounters: Encounter[];
    diagnosticReports: DiagnosticReport[];
    observations: Observation[];
  }> {
    try {
      // Get patient
      const patient = await this.medplum.readResource('Patient', patientId);

      // Get encounters
      const encountersBundle = await this.medplum.search('Encounter', {
        patient: `Patient/${patientId}`,
        _sort: '-date',
      });

      // Get diagnostic reports
      const diagnosticReportsBundle = await this.medplum.search('DiagnosticReport', {
        patient: `Patient/${patientId}`,
        _sort: '-date',
      });

      // Get observations
      const observationsBundle = await this.medplum.search('Observation', {
        patient: `Patient/${patientId}`,
        _sort: '-date',
      });

      return {
        patient,
        encounters: encountersBundle.entry?.map(e => e.resource as Encounter) || [],
        diagnosticReports: diagnosticReportsBundle.entry?.map(e => e.resource as DiagnosticReport) || [],
        observations: observationsBundle.entry?.map(e => e.resource as Observation) || [],
      };
    } catch (error) {
      console.error('Error fetching patient data:', error);
      throw error;
    }
  }
} 