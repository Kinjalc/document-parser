import { MedplumClient } from "@medplum/core";

const clientId = process.env.MEDPLUM_CLIENT_ID;
const clientSecret = process.env.MEDPLUM_CLIENT_SECRET;

/**
 * Initialize the Medplum client
 *
 * @returns A configured Medplum client
 */
async function initMedplumClient(): Promise<MedplumClient> {
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

async function documentAgent() {
  console.log("Document Agent starting...");

  try {
    // Initialize Medplum client
    const medplum = await initMedplumClient();

    // TODO

    console.log("Medplum client initialized successfully");
  } catch (error) {
    console.error("Error in document agent:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  documentAgent().catch((error) => {
    console.error(`Error in document agent: ${error}`);
    process.exit(1);
  });
}

export default documentAgent;
