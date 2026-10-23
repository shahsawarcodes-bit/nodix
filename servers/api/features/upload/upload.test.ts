import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import type { Logger } from "@workspace/logging";
import { createApp, createServer } from "../../bootstrap/index.js";
import type { ApiConfig } from "../../types/index.js";

const logger: Logger = {
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined
};

const config: ApiConfig = {
  environment: "test",
  host: "127.0.0.1",
  port: 0,
  webOrigin: "http://localhost:3000",
  logLevel: "silent"
};

void test("POST /api/upload returns 400 when no file is provided", async (context) => {
  const server = createServer({ app: createApp({ config, logger }), config, logger });
  await server.start();
  context.after(async () => {
    await server.stop();
  });
  const address = server.raw.address();
  assert.ok(address && typeof address === "object");

  const response = await fetch(`http://127.0.0.1:${String(address.port)}/api/upload`, {
    method: "POST"
  });
  assert.equal(response.status, 400);
});

void test("POST /api/upload uploads file and serves it statically under /uploads", async (context) => {
  const server = createServer({ app: createApp({ config, logger }), config, logger });
  await server.start();
  context.after(async () => {
    await server.stop();
  });
  const address = server.raw.address();
  assert.ok(address && typeof address === "object");

  const formData = new FormData();
  const fileBlob = new Blob(["test file content"], { type: "text/plain" });
  formData.append("file", fileBlob, "test-document.txt");

  const response = await fetch(`http://127.0.0.1:${String(address.port)}/api/upload`, {
    method: "POST",
    body: formData
  });

  assert.equal(response.status, 200);
  const json = (await response.json()) as { url: string; fileName: string };
  assert.ok(json.url.startsWith("/uploads/"));
  assert.equal(json.fileName, "test-document.txt");

  // Verify static serving
  const staticRes = await fetch(`http://127.0.0.1:${String(address.port)}${json.url}`);
  assert.equal(staticRes.status, 200);
  const text = await staticRes.text();
  assert.equal(text, "test file content");

  // Cleanup created test file
  const uploadedPath = path.resolve(process.cwd(), json.url.replace(/^\//, ""));
  if (fs.existsSync(uploadedPath)) {
    fs.unlinkSync(uploadedPath);
  }
});
