import { MedplumClient } from "@medplum/core";

const clientId = process.env.MEDPLUM_CLIENT_ID;
const clientSecret = process.env.MEDPLUM_CLIENT_SECRET;

/**
 * Initialize the Medplum client
 *
 * @returns A configured Medplum client
 */
export async function initMedplumClient(): Promise<MedplumClient> {
  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing required Medplum configuration. Check your .env.local file."
    );
  }

  return new MedplumClient({
    baseUrl: "https://api.medplum.com",
    clientId,
    clientSecret,
  });
}
