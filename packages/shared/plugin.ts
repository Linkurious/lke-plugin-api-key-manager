import { PluginConfig as PluginConfigBase } from "@linkurious/rest-client";

export interface PluginConfig extends PluginConfigBase {}

export interface Manifest {
  name: string;
  version: string;
  pluginApiVersion?: string;
  publicRoute?: string;
  singlePageAppIndex?: string;
  backendFiles?: string[];
}
