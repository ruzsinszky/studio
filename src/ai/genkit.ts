import {genkit} from 'genkit';
// import * as AzureOpenAIPlugin from 'genkitx-azure-openai'; // Temporarily commented out due to package structure issue

export const ai = genkit({
  plugins: [
    // AzureOpenAIPlugin.azureOpenAi({ // Temporarily commented out
    //   apiKey: process.env.AZURE_OPENAI_API_KEY,
    //   endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    //   // You may also need to specify apiVersion depending on your Azure setup and plugin requirements.
    //   apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview', // Using a default if not provided by env var
    //   // deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME, // This might be needed depending on the plugin configuration and how models are specified.
    // }),
  ],
  // The model configuration below depends on the Azure OpenAI plugin.
  // It's commented out as the plugin itself is causing a build error.
  // model: `azureOpenAi/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`, 
});
