// electron.vite.config.ts
import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
var electron_vite_config_default = defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ["@electron-toolkit/utils"]
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        external: ["@electron-toolkit/utils"]
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        "@": path.resolve("src")
      }
    },
    plugins: [react()]
  }
});
export {
  electron_vite_config_default as default
};
