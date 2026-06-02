import type { PluginConfig as PluginConfigBase } from "@linkurious/rest-client/dist/src/api/plugin";

export interface PluginConfig extends PluginConfigBase {
  //no additional parameters required
}

export interface Manifest {
  name: string;
  version: string;
  pluginApiVersion?: string;
  publicRoute?: string;
  singlePageAppIndex?: string;
  backendFiles?: string[];
}
