import { MedplumClient } from '@medplum/core';

export abstract class BaseMedplumService {
  protected medplum: MedplumClient;

  constructor() {
    this.medplum = new MedplumClient({
      clientId: process.env.MEDPLUM_CLIENT_ID!,
      clientSecret: process.env.MEDPLUM_CLIENT_SECRET!,
    });
  }

  protected formatDateToISO(dateStr: string): string {
    return `${dateStr}T00:00:00Z`;
  }
} 