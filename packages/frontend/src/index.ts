import { Classic } from "@caido/primevue";
import PrimeVue from "primevue/config";
import { createApp } from "vue";

import App from "./views/App.vue";

import "./styles/index.css";

import { SDKPlugin } from "./plugins/sdk";
import type { FrontendSDK } from "./types";



// This is the entry point for the frontend plugin
export const init = (sdk: FrontendSDK) => {
  const app = createApp(App);

  // Load the PrimeVue component library
  app.use(PrimeVue, {
    unstyled: true,
    pt: Classic,
  });

  // Provide the FrontendSDK
  app.use(SDKPlugin, sdk);

  // Create the root element for the app
  const root = document.createElement("div");
  Object.assign(root.style, {
    height: "100%",
    width: "100%",
  });

  // Set the ID of the root element to match our plugin ID
  // This matches the prefixWrap plugin in caido.config.ts 
  // This is necessary to prevent styling conflicts between plugins
  root.id = `plugin--chatview`;

  // Mount the app to the root element
  app.mount(root);

  // Add the page to the navigation
  // Make sure to use a unique name for the page
  sdk.navigation.addPage("/chatio", {
    body: root,
  });

  // Add a sidebar item
  sdk.sidebar.registerItem("Chatio", "/chatio", {
    icon: "fas fa-robot"
  });
};
