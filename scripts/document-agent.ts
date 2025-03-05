import { initMedplumClient } from "../lib/medplum";

async function documentAgent() {
  console.log("Document Agent starting...");

  try {
    // Initialize Medplum client
    const medplum = await initMedplumClient();
    console.log("Medplum client initialized successfully");

    // TODO: Implement the document agent
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
