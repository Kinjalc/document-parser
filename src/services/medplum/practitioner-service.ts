import { MedplumClient } from '@medplum/core';
import * as dotenv from 'dotenv';
import { BaseMedplumService } from './base-service';

dotenv.config({ path: '.env.local' });

export class MedplumPractitionerService extends BaseMedplumService {
  constructor() {
    super();
  }

  async findPractitioner(name: string): Promise<any> {
    try {
      const response = await this.medplum.search('Practitioner', { name });
      return response;
    } catch (error) {
      console.error('Error finding practitioner:', error);
      throw error;
    }
  }

  async createPractitioner(name: string): Promise<any> {
    try {
      const [firstName, lastName] = name.split(' ');
      const practitioner = await this.medplum.createResource({
        resourceType: 'Practitioner',
        qualification: [
          {
            code: {
              coding: [
                {
                  code: 'PRACTITIONER_CODE',
                  system: 'PRACTITIONER_ISSUER',
                },
              ],
            },
          },
        ],
        name: [
          {
            family: lastName,
            given: [firstName],
          },
        ],
      });
      return practitioner;
    } catch (error) {
      console.error('Error creating practitioner:', error);
      throw error;
    }
  }

  async findOrCreatePractitioner(name: string): Promise<any> {
    try {
      const searchResult = await this.findPractitioner(name);
      if (searchResult && searchResult.length > 0) {
        console.log('Found existing practitioner');
        return searchResult[0];
      }
      console.log('Creating new practitioner');
      return await this.createPractitioner(name);
    } catch (error) {
      console.error('Error in findOrCreatePractitioner:', error);
      throw error;
    }
  }
} 