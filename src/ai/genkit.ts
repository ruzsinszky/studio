
import {genkit} from 'genkit';
import {azureOpenAi} from 'genkitx-azure-openai'; // Use direct import as per plugin docs

export const ai = genkit({
  plugins: [
    azureOpenAi({
      apiKey: process.env.AZURE_OPENAI_API_KEY!, 
      endpoint: process.env.AZURE_OPENAI_ENDPOINT!, 
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview', 
      chatDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME!, 
    }),
  ],
  // model: `azureOpenAi/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`, // This can be left commented if specified in each call
});

// The console warning about the plugin being commented out is removed as we are re-enabling it.
// If the build fails due to the package issue, this file might need to be reverted.
