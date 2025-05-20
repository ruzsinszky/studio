
import {genkit} from 'genkit';
// import {azureOpenAi} from 'genkitx-azure-openai'; // Use direct import as per plugin docs

export const ai = genkit({
  plugins: [
    //  azureOpenAi({
    //    apiKey: process.env.AZURE_OPENAI_API_KEY!, 
    //    endpoint: process.env.AZURE_OPENAI_ENDPOINT!, 
    //    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview', 
    //    chatDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME!, 
    //  }),
  ],
  // model: `azureOpenAi/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`, // This can be left commented if specified in each call
});

// Add a console warning if Azure environment variables are set but the plugin is commented out.
if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_DEPLOYMENT_NAME) {
  console.warn(
    "WARNING: Azure OpenAI environment variables are set, but the 'genkitx-azure-openai' " +
    "plugin is currently commented out in src/ai/genkit.ts due to a persistent package import issue. " +
    "Azure OpenAI functionality will be unavailable until this is resolved."
  );
}

