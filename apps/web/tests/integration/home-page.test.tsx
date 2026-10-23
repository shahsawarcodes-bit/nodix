import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { WorkspaceFoundation } from "../../features/workspace-foundation";

test("composes environment-derived API configuration into the health action", () => {
  const markup = renderToStaticMarkup(<WorkspaceFoundation apiBaseUrl="https://api.example.test" />);
  assert.match(markup, /The application foundation is running/);
  assert.match(markup, /href="https:\/\/api\.example\.test\/health"/);
});
