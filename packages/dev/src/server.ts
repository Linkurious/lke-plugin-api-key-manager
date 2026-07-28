import fs from "fs";
import path from "path";

import { RestClient } from "@linkurious/rest-client";
import type { PluginConfig as IPluginConfig } from "@linkurious/rest-client";
import { CookieAccessInfo } from "cookiejar";
import { config as loadDotenv } from "dotenv";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import superagent from "superagent";
import routeHandler from "backend/src/routes";

import type { PluginRouteOptions, Manifest } from "../../shared";
import { parseLinkuriousAPI } from "../../shared";

loadDotenv();

const LKE_URL = new URL(process.env.LKE_URL || "http://localhost:3000");
const LOCAL_URL = new URL(process.env.LOCAL_URL || "http://localhost:4000");
const LOCAL_PORT =
  +LOCAL_URL.port || { "http:": 80, "https:": 443 }[LOCAL_URL.protocol] || -1;

// Update the path for the manifest.json file
const manifestPath = path.resolve(__dirname, "../../../manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Manifest;
console.info("Manifest", JSON.stringify(manifest), "\n");

// Update the path for the plugin-config.json file
let config: IPluginConfig = {
  basePath: `${manifest.name}`,
};
try {
  const configPath = path.resolve(__dirname, "../../../plugin-config.json");
  config = JSON.parse(fs.readFileSync(configPath, "utf8")) as IPluginConfig;
} catch (e) {
  console.warn("No plugin-config.json found, using default configuration");
}
console.info("Config", JSON.stringify(config), "\n");

const app = express();
const apiRouter = express.Router();
const PLUGIN_BASE_PATH = `/plugins/${config.basePath}`;
let lkeSessionCookie = process.env.LKE_SESSION_COOKIE || undefined;

const BASE_RX = /<base href="\/">/gi;
function injectBasePath(srcFilePath: string) {
  let content = fs.readFileSync(srcFilePath, "utf-8");
  if (BASE_RX.test(content)) {
    content = content.replace(BASE_RX, `<base href="${PLUGIN_BASE_PATH}/">`);
  }
  return content;
}

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Handle singlePageAppIndex and patch the base tag of any html file
app.use(`${PLUGIN_BASE_PATH}/api`, apiRouter);
if (manifest.publicRoute) {
  // Update the path for publicRoute
  // In dev mode, serve from packages/frontend/public (esbuild watch output)
  const publicRoute = path.resolve(
    __dirname,
    "../../../packages/frontend/public",
  );

  // Inject base path on all htm / html pages
  app.get(
    new RegExp(
      // eslint-disable-next-line no-useless-escape
      `^${escapeRegex(PLUGIN_BASE_PATH)}(\/[^\/\?\#]+)*(?:\/|[^\/\?\#]+\.htm[l]?)$`,
    ),
    (req, res, next) => {
      let requestPath = req.path.substring(PLUGIN_BASE_PATH.length);
      // Add the default index.html if no file is passed
      if (requestPath.endsWith("/")) {
        requestPath += "index.html";
      }

      const htmlPath = path.resolve(publicRoute, requestPath.slice(1));
      if (!fs.existsSync(htmlPath)) {
        // Default behavior
        next();
        return;
      }

      res.setHeader("Content-Type", "text/html");
      res.send(injectBasePath(htmlPath));
    },
  );

  // Handle static files
  app.use(PLUGIN_BASE_PATH, express.static(publicRoute));

  if (manifest.singlePageAppIndex) {
    const htmlPath = path.resolve(publicRoute, manifest.singlePageAppIndex);

    // Handle the rest (not htm / html page and not static files)
    // Executed at every request to allow realtime changes
    app.use(PLUGIN_BASE_PATH, (req, res, next) => {
      if (!fs.existsSync(htmlPath)) {
        // Default behavior
        return next();
      }

      res.setHeader("Content-Type", "text/html");
      res.send(injectBasePath(htmlPath));
    });
  }
}

app.use(
  // Inject session cookie to the frontend
  (req, res, next) => {
    if (lkeSessionCookie) {
      res.cookie("linkurious.session", lkeSessionCookie, {
        httpOnly: true,
        // Prevents the default URI encoding altering the cookie
        encode: (val) => val,
      });
    }
    return next();
  },
  // Proxy all not handled routes
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  (req, res, next) => {
    console.debug(`Proxying request: ${req.method} ${req.path}`);
    // Local routes should have already been intercepted before
    if (req.path.startsWith(PLUGIN_BASE_PATH)) {
      // Don't proxy this route, pass to next middleware
      console.error("This should have never been triggered");
      return next();
    }

    return createProxyMiddleware({
      target: LKE_URL,
      changeOrigin: true,
    })(req, res, next);
  },
);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.listen(LOCAL_PORT, async () => {
  console.info(
    `Example app listening on '${new URL(PLUGIN_BASE_PATH, LOCAL_URL).href}'!\n`,
  );

  try {
    const authAgent = superagent.agent();

    if (lkeSessionCookie) {
      authAgent.jar.setCookie(
        `linkurious.session=${lkeSessionCookie}`,
        LOCAL_URL.hostname,
        "/",
      );
    }

    if (!lkeSessionCookie && process.env.LKE_USER && process.env.LKE_PASS) {
      await authAgent
        .post(new URL("/api/auth/login", LOCAL_URL).toString())
        .send({
          usernameOrEmail: process.env.LKE_USER,
          password: process.env.LKE_PASS,
        });
    }

    const cookie = authAgent.jar.getCookie(
      "linkurious.session",
      new CookieAccessInfo(LOCAL_URL.hostname, "/", false, false),
    );
    if (cookie && cookie.value !== lkeSessionCookie) {
      lkeSessionCookie = cookie.value;
    }

    const restClientHeaders: [field: string, value: string][] = lkeSessionCookie
      ? [["Cookie", `linkurious.session=${lkeSessionCookie}`]]
      : [];

    const restClient: RestClient = new RestClient({
      baseUrl: `http://localhost:${LOCAL_PORT}`,
      headers: restClientHeaders,
    });

    const user = await parseLinkuriousAPI(restClient.auth.getCurrentUser());
    console.info(
      `Connected with user #${user.id} ${user.username} (${user.email})`,
    );

    console.debug("Session cookie", JSON.stringify(lkeSessionCookie));

    const options: PluginRouteOptions = {
      router: apiRouter,
      configuration: config,
      getRestClient: () => {
        return restClient;
      },
    };

    // TODO: call the handler for all the `backendFiles` of the manifest
    routeHandler(options);
  } catch (err) {
    console.error("Error during initialization:", err);
    console.info("Server terminated!");
    process.exit(1);
  }
});
