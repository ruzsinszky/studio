
import {genkit} from 'genkit';
// import {azureOpenAi} from 'genkitx-azure-openai'; // Use direct import as per plugin docs

export const ai = genkit({
  plugins: [
    // azureOpenAi({
    //   apiKey: process.env.AZURE_OPENAI_API_KEY!, 
    //   endpoint: process.env.AZURE_OPENAI_ENDPOINT!, 
    //   apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview', 
    //   chatDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME!, 
    // }),
  ],
  // model: `azureOpenAi/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`, // This can be left commented if specified in each call
});

// Log a warning if Azure environment variables are set but the plugin is commented out
if (process.env.AZURE_OPENAI_API_KEY || process.env.AZURE_OPENAI_ENDPOINT || process.env.AZURE_OPENAI_DEPLOYMENT_NAME) {
  const isAzurePluginCommentedOut = !ai.listPlugins().some(p => p.name === 'azureOpenAi'); // A simple check
  if (isAzurePluginCommentedOut) {
    console.warn(
      "************************************************************************************************************************\n" +
      "WARNING: Azure OpenAI environment variables are set, but the Azure OpenAI plugin in src/ai/genkit.ts is commented out.\n" +
      "This is likely due to a persistent build issue with the 'genkitx-azure-openai' package.\n" +
      "As a result, Azure OpenAI functionality will be unavailable.\n" +
      "To attempt to use Azure OpenAI, you can try uncommenting the plugin, but this may cause build failures.\n" +
      "************************************************************************************************************************"
    );
  }
}
