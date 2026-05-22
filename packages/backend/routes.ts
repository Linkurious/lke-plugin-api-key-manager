import * as express from "express";
import type { PluginRouteOptions } from "@linkurious/rest-client";

import { PluginConfig } from "../@types/plugin";

import { loggerFormatter, parseLinkuriousAPI } from "./shared";
import { PluginError, UnauthorizedPluginError } from "./exceptions";

type RightsMap = {
  [key: string]: {
    counter: number;
    actions: string[];
  };
};

type GroupsMap = {
  datasources: {
    name: string;
    sourcekey: string;
    connected: boolean;
    groups: {
      name: string;
      id: number;
    }[];
  }[];
  groups: string[];
  admin_group: number;
};

type DataSourceItem = {
  key: string;
  name: string;
  connected: boolean;
  state?: string;
};

type GroupItem = {
  id: number;
  name: string;
  builtin?: boolean;
  sourceKey?: string;
};

type ApplicationItem = {
  id: number;
  name: string;
  enabled: boolean;
  apiKey: string;
  groups: GroupItem[];
  rights: string[] | RightsMap;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function toDataSources(value: unknown): DataSourceItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const output: DataSourceItem[] = [];
  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }
    const key = asString(item.key);
    const name = asString(item.name);
    const connected = asBoolean(item.connected);
    if (key !== undefined && name !== undefined && connected !== undefined) {
      output.push({
        key: key,
        name: name,
        connected: connected,
        state: asString(item.state),
      });
    }
  }
  return output;
}

function toGroups(value: unknown): GroupItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const output: GroupItem[] = [];
  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }

    const id = asNumber(item.id);
    const name = asString(item.name);
    if (id !== undefined && name !== undefined) {
      output.push({
        id: id,
        name: name,
        builtin: asBoolean(item.builtin),
        sourceKey: asString(item.sourceKey),
      });
    }
  }
  return output;
}

function toApplications(value: unknown): ApplicationItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const output: ApplicationItem[] = [];
  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }

    const id = asNumber(item.id);
    const name = asString(item.name);
    const enabled = asBoolean(item.enabled);
    const apiKey = asString(item.apiKey);
    if (
      id !== undefined &&
      name !== undefined &&
      enabled !== undefined &&
      apiKey !== undefined
    ) {
      output.push({
        id: id,
        name: name,
        enabled: enabled,
        apiKey: apiKey,
        groups: toGroups(item.groups),
        rights: toActionList(item.rights),
      });
    }
  }
  return output;
}

function toActionList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((action): action is string => typeof action === "string");
}

console.log("Routes module loaded");

export = async function configureRoute(
  options: PluginRouteOptions<PluginConfig> & { serverRootFolder?: string },
): Promise<void> {
  console.log("Configuring routes...");

  console.log = loggerFormatter(console.log);
  console.warn = loggerFormatter(console.warn);
  console.info = loggerFormatter(console.info);
  console.error = loggerFormatter(console.error);
  console.debug = loggerFormatter(console.debug);

  options.router.use(express.json());
  console.log("JSON body parser configured");

  function respond(
    promiseFunction: (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => Promise<void> | void,
  ): express.RequestHandler {
    return (req, res, next) => {
      Promise.resolve(promiseFunction(req, res, next)).catch((e) => {
        if (e instanceof PluginError) {
          res
            .status(e.getHttpResponseCode())
            .json({ error: e.name, message: e.message });
        } else if (e instanceof Error) {
          res.status(500).json({ error: e.name, message: e.message });
        } else {
          res.status(500).json(JSON.stringify(e));
        }
      });
    };
  }

  options.router.use(
    respond(async (req, res, next) => {
      const restClient = options.getRestClient(req);
      /*
       * Check Securities or other custom code which should be executed for every call
       */
      await parseLinkuriousAPI(restClient.auth.getCurrentUser(), (body) => {
        if (!body.groups.find((g) => g.name === "admin")) {
          throw new UnauthorizedPluginError(["admin"]);
        }
      });
      next();
    }),
  );

  /**
   * Validate the user access rights
   */
  options.router.get(
    "/authorize",
    // It does anything because the whole logic is in a middleware
    respond((req, res) => {
      res.sendStatus(204);
    }),
  );

  options.router.get(
    "/keys",
    respond(async (req, res) => {
      const restClient = options.getRestClient(req);

      const datasources = (
        await parseLinkuriousAPI(
          restClient.dataSource.getDataSources(),
          (body) => toDataSources(body),
        )
      ).reduce((map: Record<string, string>, ds) => {
        if (ds.state === "ready") {
          map[ds.key] = ds.name;
        }
        return map;
      }, {});

      await parseLinkuriousAPI(
        restClient.application.getApplications(),
        (body) => {
          const applications = toApplications(body);
          applications.forEach((key) => {
            key.groups
              .sort((a, b) => a.id - b.id)
              .forEach((group) => {
                if (group.sourceKey === "*") {
                  group.sourceKey = "*";
                } else if (
                  group.sourceKey !== undefined &&
                  group.sourceKey in datasources
                ) {
                  group.sourceKey = `${datasources[group.sourceKey]} (${group.sourceKey})`;
                } else if (group.sourceKey !== undefined) {
                  group.sourceKey = "Disconnected (" + group.sourceKey + ")";
                } else {
                  group.sourceKey = "Disconnected";
                }
              });

            key.rights = groupActions(toActionList(key.rights));
          });

          applications.sort((a, b) => {
            if (a.enabled !== b.enabled) {
              return Number(b.enabled) - Number(a.enabled);
            }
            return a.name.localeCompare(b.name);
          });
          return res.json(applications);
        },
      );
    }),
  );

  options.router.get(
    "/keys/:id",
    respond(async (req, res) => {
      const restClient = options.getRestClient(req);
      const appId = req.params.id;

      await parseLinkuriousAPI(
        restClient.application.getApplications(),
        (body) => {
          const app = toApplications(body).find(
            (key) => key.id.toString() === appId,
          );
          if (!app) {
            return res
              .status(404)
              .json({ error: "NotFound", message: "Application not found" });
          }

          app.rights = groupActions(toActionList(app.rights));

          return res.json(app);
        },
      );
    }),
  );

  options.router.put(
    "/changeKeyState",
    respond(async (req, res) => {
      const restClient = options.getRestClient(req);
      const { id, enabled } = req.body as {
        id: string | number;
        enabled: boolean;
      };
      const applicationId =
        typeof id === "number" ? id : Number.parseInt(id, 10);

      await parseLinkuriousAPI(
        restClient.application.updateApplication({
          id: applicationId,
          enabled: enabled,
        }),
        (body) => {
          return res.json(body);
        },
      );
    }),
  );

  options.router.get(
    "/groups",
    respond(async (req, res) => {
      const result: GroupsMap = { datasources: [], groups: [], admin_group: 1 };
      const restClient = options.getRestClient(req);
      const datasources = await parseLinkuriousAPI(
        restClient.dataSource.getDataSources(),
        (body) => toDataSources(body),
      );

      for (const datasource of datasources) {
        let groups: GroupItem[] = [];
        if (datasource.connected) {
          groups = await parseLinkuriousAPI(
            restClient.user.getGroups({ sourceKey: datasource.key }),
            (body) => toGroups(body),
          );

          for (const group of groups) {
            const groupName = group.name;
            if (groupName === "admin" && group.builtin === true) {
              result.admin_group = group.id;
            } else if (groupName && !result.groups.includes(groupName)) {
              result.groups.push(groupName);
            }
          }
        }

        result.datasources.push({
          name: datasource.name,
          connected: datasource.connected,
          sourcekey: datasource.key !== undefined ? datasource.key : "",
          groups: groups.map((g) => ({ name: g.name, id: g.id })),
        });
      }
      res.json(result);
    }),
  );

  console.log("Routes loaded");
};

function groupActions(actionList: string[]): RightsMap {
  return actionList.reduce((acc, currentAction) => {
    const parts = currentAction.split(".");

    let prefix: string;
    let action: string | null;

    if (parts.length === 1) {
      prefix = currentAction;
      action = null;
    } else {
      prefix = parts[0];
      action = parts.slice(1).join(".");
    }

    if (!acc[prefix]) {
      acc[prefix] = { counter: 0, actions: [] };
    }

    acc[prefix].counter += 1;
    if (action) {
      acc[prefix].actions.push(action);
    }

    return acc;
  }, {} as RightsMap);
}
