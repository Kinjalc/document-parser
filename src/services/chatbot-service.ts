import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { FhirService } from './fhir-service';
import { Patient, Encounter, DiagnosticReport, Observation } from '@medplum/fhirtypes';

export class ChatbotService {
  private fhirService: FhirService;

  constructor() {
    this.fhirService = new FhirService();
  }

  private formatPatientData(data: {
    patient: Patient;
    encounters: Encounter[];
    diagnosticReports: DiagnosticReport[];
    observations: Observation[];
  }): string {
    const { patient, encounters, diagnosticReports, observations } = data;
    
    let formattedData = `Patient Information:
Name: ${patient.name?.[0]?.text || 'N/A'}
Gender: ${patient.gender || 'N/A'}
Birth Date: ${patient.birthDate || 'N/A'}

Recent Encounters:
${encounters.map(e => `- Date: ${e.period?.start || 'N/A'}
  Provider: ${e.serviceProvider?.display || 'N/A'}
  Status: ${e.status || 'N/A'}
  Reason: ${e.reasonCode?.[0]?.text || 'N/A'}`).join('\n')}

Recent Lab Results:
${diagnosticReports.map(dr => `- Date: ${dr.effectiveDateTime || 'N/A'}
  Test: ${dr.code?.text || 'N/A'}
  Status: ${dr.status || 'N/A'}
  Conclusion: ${dr.conclusion || 'N/A'}`).join('\n')}

Recent Observations:
${observations.map(o => `- Date: ${o.effectiveDateTime || 'N/A'}
  Test: ${o.code?.text || 'N/A'}
  Value: ${o.valueQuantity?.value} ${o.valueQuantity?.unit || ''}
  Interpretation: ${o.interpretation?.[0]?.text || 'N/A'}`).join('\n')}`;

    return formattedData;
  }

  async generateResponse(patientId: string, query: string): Promise<string> {
    try {
      // Get patient data
      const patientData = await this.fhirService.getPatientData(patientId);
      const formattedData = this.formatPatientData(patientData);

      // Generate response using LLM
      const prompt = `You are a medical assistant chatbot. Use the following patient data to answer the user's question. 
If you don't have enough information to answer the question, say so. Be concise but informative.

Patient Data:
${formattedData}

User Question: ${query}

Please provide a helpful response based on the available data.`;

      const result = await generateText({
        model: anthropic('claude-3-5-sonnet-20241022'),
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      return result.text;
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }
} 