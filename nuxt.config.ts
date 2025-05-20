// the echo versioning system
import { execSync } from "child_process";
const cmSha = execSync("git rev-parse --short HEAD").toString();
const cmDate = new Date(
  parseInt(execSync("git log -1 --format=%ct").toString().trim()) * 1000
).toISOString();

import tailwindcss from "@tailwindcss/vite";
import localforage from 'localforage'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      htmlAttrs: {
        lang: "en",
      },
      title: "Signal",
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Signal",
        },
      ],
    },
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      sha: cmSha,
      date: cmDate,
    },
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  provide: {
    localforage
  }
})
