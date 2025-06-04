import { Caido } from "@caido/sdk-frontend";

// Define simplified API that matches the backend
interface API {
  healthCheck: () => Promise<{ status: string }>;
  getProviders: () => Promise<string[]>;
  getProviderModels: (provider: string) => Promise<string[]>;
}

export type FrontendSDK = Caido<API, {}>;
