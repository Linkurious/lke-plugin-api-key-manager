import * as express from 'express';
import  type { ApiRight, IConnectDataSourceParams, PluginRouteOptions } from '@linkurious/rest-client';

import { PluginConfig } from '../@types/plugin';

import { loggerFormatter, parseLinkuriousAPI } from './shared';
import { PluginError, UnauthorizedPluginError } from './exceptions';

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

console.log("Routes module loaded");

export = async function configureRoute (
  options: PluginRouteOptions<PluginConfig> & { serverRootFolder?: string }
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
      next: express.NextFunction
    ) => Promise<void> | void
  ): express.RequestHandler {
    return (req, res, next) => {
      Promise.resolve(promiseFunction(req, res, next)).catch((e) => {
        if (e instanceof PluginError) {
          res.status(e.getHttpResponseCode()).json({ error: e.name, message: e.message });
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
        if (!body.groups.find((g) => g.name === 'admin')) {
          throw new UnauthorizedPluginError(['admin']);
        }
      });
      next();
    })
  );

  /**
   * Validate the user access rights
   */
  options.router.get(
    '/authorize',
    // It does anything because the whole logic is in a middleware
    respond((req, res) => {
      res.sendStatus(204);
    })
  );

  options.router.get(
    '/keys',
    respond(async (req, res) => {
      const restClient = options.getRestClient(req);

      let datasources = (await parseLinkuriousAPI(restClient.dataSource.getDataSources(), (body) => body))
        .filter((datasource: any) => datasource.state === 'ready')
        .reduce((map: Record<string, string>, ds: any) => {
          map[ds.key] = ds.name;
          return map;
        }, {});

      await parseLinkuriousAPI(restClient.application.getApplications(), (body) => {
        body.forEach((key: any) => {
            key.groups
            .sort((a: any, b: any) => a.id - b.id)
            .forEach((group: any) => {
              if (group.sourceKey === "*") {
                group.sourceKey = "*";
              } else if (group.sourceKey in datasources) {
                group.sourceKey = `${datasources[group.sourceKey]} (${group.sourceKey})`;
              } else {
                group.sourceKey = "Disconnected (" + group.sourceKey + ")";
              }
            });

          key.rights = groupActions(key.rights);
        });
        
        // Sort by name and by state
        body.sort((a: any, b: any) => {
          if (a.enabled !== b.enabled) {
            return b.enabled - a.enabled;
          }
          return a.name.localeCompare(b.name);
        });

        return res.json(body);
      });
    })
  );

  options.router.get(
    '/keys/:id',
    respond(async (req, res) => {
      const restClient = options.getRestClient(req);
      const appId = req.params.id;

      await parseLinkuriousAPI(restClient.application.getApplications(), (body) => {
        let app: any = body.find((key: any) => key.id.toString() === appId);
        if (!app) {
          return res.status(404).json({ error: 'NotFound', message: 'Application not found' });
        }

        app.rights = groupActions(app.rights);

        return res.json(app);
      });
    })
  );

  options.router.put(
    '/changeKeyState',
    respond(async (req, res) => {
      const restClient = options.getRestClient(req);
      const { id, enabled } = req.body;

      await parseLinkuriousAPI(restClient.application.updateApplication({
        id: parseInt(id),
        enabled: enabled
      }), (body) => {
        return res.json(body);
      });
    })
  );

  options.router.get(
    '/groups',
    respond(async (req, res) => {

      let result: GroupsMap = { datasources: [], groups: [], admin_group: 1 };
      const restClient = options.getRestClient(req);
      const datasources = await parseLinkuriousAPI(restClient.dataSource.getDataSources());

      for (const datasource of datasources) {

        let groups : any[] = [];
        if (datasource.connected) {
          groups = await parseLinkuriousAPI(restClient.user.getGroups({ sourceKey: datasource.key }));

          for (const group of groups) {
            if (group.name === 'admin' && group.builtin === true) {
              result.admin_group = group.id;
            }
            else if (!result.groups.includes(group.name)) {
              result.groups.push(group.name);
            }
          }
        }

        result.datasources.push({
          name: datasource.name,
          connected: datasource.connected,
          sourcekey: (datasource.key !== undefined) ? datasource.key : '',
          groups: groups.map((g: any) => ({ name: g.name, id: g.id }))
        });
      }
      console.log(result);
      res.json(result);
    })
  );

  console.log("Routes loaded");
};


function groupActions(actionList: string[]): RightsMap {
  return actionList.reduce((acc, currentAction) => {
    const parts = currentAction.split('.');

    let prefix: string;
    let action: string | null;

    if (parts.length === 1) {
      prefix = currentAction;
      action = null;
    } else {
      prefix = parts[0];
      action = parts.slice(1).join('.');
    }

    if (!acc[prefix]) {
      acc[prefix] = { counter: 0, actions: [] }
    }

    acc[prefix].counter += 1;
    if (action) {
      acc[prefix].actions.push(action);
    }

    return acc;
  }, {} as RightsMap);
}