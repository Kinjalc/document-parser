# Document Parser

A project using Medplum packages for FHIR document parsing and management.

## Setup

This project uses npm for package management. The following packages are installed:

- React 18
- React DOM 18
- @medplum/core
- @medplum/fhirtypes
- @medplum/react
- TypeScript

## Getting Started

To install dependencies:

```bash
npm install
```

### Environment Configuration

Create a `.env.local` by copying the .env.example file and assigning the appropriate environment variables:

```
# Medplum API configuration
MEDPLUM_BASE_URL=https://api.medplum.com/
MEDPLUM_CLIENT_ID=your-client-id
MEDPLUM_CLIENT_SECRET=your-client-secret

# Document processing settings
DOCUMENT_STORAGE_PATH=./documents
MAX_DOCUMENT_SIZE_MB=10
ENABLE_DOCUMENT_PARSING=true
```

## Development

This project is set up with TypeScript.

### Available Scripts

- `npm run document-agent` - Runs the document agent script that fetches and processes FHIR documents

### Project Structure

- `scripts/` - Utility scripts
  - `document-agent.ts` - Script for fetching and processing FHIR documents

## Document Agent

The document agent script right now only connects to the Medplum API. You are encouraged to . To run it:

```bash
npm run document-agent
```
