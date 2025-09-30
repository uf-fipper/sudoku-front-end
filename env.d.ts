/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_BASE_HOST: string;
  readonly VITE_BASE_HTTP_PROTOCOL: string;
  readonly VITE_BASE_WS_PROTOCOL: string;
}
