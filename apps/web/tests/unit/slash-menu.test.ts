import test from "node:test";
import assert from "node:assert/strict";
import { SLASH_COMMANDS } from "../../features/editor/components/slash-menu-items";

test("slash menu contains all 14 supported block types", () => {
  const expectedTypes = [
    "text",
    "h1",
    "h2",
    "h3",
    "bulleted_list",
    "numbered_list",
    "todo",
    "toggle",
    "quote",
    "code",
    "divider",
    "link_to_page",
    "image",
    "file"
  ];

  const actualTypes = SLASH_COMMANDS.map((cmd) => cmd.type);
  assert.deepEqual(actualTypes, expectedTypes);
});

test("each slash command has label, keywords, and renderIcon", () => {
  for (const cmd of SLASH_COMMANDS) {
    assert.ok(cmd.label.length > 0, `Command ${cmd.type} missing label`);
    assert.ok(cmd.keywords.length > 0, `Command ${cmd.type} missing keywords`);
    assert.equal(typeof cmd.renderIcon, "function", `Command ${cmd.type} missing renderIcon`);
  }
});

test("slash command shortcuts match expected markdown triggers", () => {
  const shortcutMap = Object.fromEntries(
    SLASH_COMMANDS.map((c) => [c.type, c.shortcut ?? "none"])
  );

  assert.equal(shortcutMap["h1"], "#");
  assert.equal(shortcutMap["h2"], "##");
  assert.equal(shortcutMap["h3"], "###");
  assert.equal(shortcutMap["bulleted_list"], "-");
  assert.equal(shortcutMap["numbered_list"], "1.");
  assert.equal(shortcutMap["todo"], "[]");
  assert.equal(shortcutMap["toggle"], ">");
  assert.equal(shortcutMap["quote"], '"');
  assert.equal(shortcutMap["code"], "```");
  assert.equal(shortcutMap["divider"], "---");
});
