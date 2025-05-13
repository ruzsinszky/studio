import {genkit} from 'genkit';
import {azureAI} from '@genkit-ai/plugin-azure-ai';

export const ai = genkit({
  plugins: [
    azureAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      // You may also need to specify apiVersion depending on your Azure setup and plugin requirements.
      // e.g., apiVersion: '2024-02-01' // Example, adjust if needed for your specific Azure OpenAI deployment
      // deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME, // This might be needed if not implicitly handled by model string
    }),
  ],
  // Use the environment variable for the default text model deployment name
  // The model string for Azure OpenAI should typically include the deployment name.
  // Format: azureAI/<YOUR_AZURE_OPENAI_DEPLOYMENT_NAME>
  model: `azureAI/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
});
