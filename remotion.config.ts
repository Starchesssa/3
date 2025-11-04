
// remotion.config.ts
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");

// Config.setFfmpegOverride(() => "ffmpeg"); // ❌ remove this line in v4
