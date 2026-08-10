/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.setRspack(true);
// PNG rather than JPEG for the intermediate frames: this film is almost all
// flat cream and soft gradients, which is exactly where JPEG banding shows.
Config.setVideoImageFormat("png");
// A low CRF because the deliverable is projected for funders and partners.
Config.setCrf(16);
Config.setOverwriteOutput(true);
Config.overrideBundlerConfig(enableTailwind);
