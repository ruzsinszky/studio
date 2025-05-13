import {genkit} from 'genkit';
import {azureOpenAi} from 'genkitx-azure-openai'; // Changed import

export const ai = genkit({
  plugins: [
    azureOpenAi({ // Changed function call
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      // You may also need to specify apiVersion depending on your Azure setup and plugin requirements.
      // e.g., apiVersion: '2024-02-01' // Example, adjust if needed for your specific Azure OpenAI deployment
      // deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME, // This might be needed if not implicitly handled by model string
    }),
  ],
  // Use the environment variable for the default text model deployment name
  // The model string for Azure OpenAI should typically include the deployment name.
  // Format: azureOpenAi/<YOUR_AZURE_OPENAI_DEPLOYMENT_NAME> // Changed prefix documentation
  model: `azureOpenAi/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`, // Changed model prefix
});
