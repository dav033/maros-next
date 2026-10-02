import { beforeEach, describe, expect, it, vi } from "vitest";
import { findSuggestionMatch } from "@tiptap/suggestion";
import { Node as PMNode, Schema } from "@tiptap/pm/model";
import type { NoteReferenceTarget } from "@/notes/domain";

const search = vi.hoisted(() => vi.fn());
vi.mock("./referenceTargetSearch", () => ({ searchReferenceTargets: search }));

// Imported after the mock so the extensions close over the stub.
const { noteReferenceExtensions } = await import("./noteReferenceExtensions");

const target = (over: Partial<NoteReferenceTarget> = {}): NoteReferenceTarget => ({
  kind: "note",
  id: 7,
  label: "Site survey",
  sublabel: null,
  exists: true,
  ...over,
});

type SuggestionOptionsShape = {
  char: string;
  allowSpaces?: boolean;
  items: (props: { query: string }) => Promise<unknown[]>;
};

function suggestionOf(name: "entityMention" | "noteLink", deps = {}): SuggestionOptionsShape {
  const extension = noteReferenceExtensions(deps).find((e) => e.name === name);
  if (!extension) throw new Error(`${name} was not built`);
  return (extension.options as unknown as { suggestion: SuggestionOptionsShape }).suggestion;
}

/**
 * A minimal schema with one text block, which is all findSuggestionMatch needs: it reads
 * the text node before the cursor and nothing else about the document.
 */
const schema = new Schema({
  nodes: {
    doc: { content: "paragraph+" },
    paragraph: { content: "text*", toDOM: () => ["p", 0] },
    text: {},
  },
});

/**
 * The Trigger shape findSuggestionMatch expects, with the defaults @tiptap/suggestion
 * itself passes. Only `char`, `allowSpaces` and the text differ between these cases.
 */
function trigger(char: string, allowSpaces: boolean, text: string) {
  return {
    char,
    allowSpaces,
    allowToIncludeChar: false,
    allowedPrefixes: [" "],
    startOfLine: false,
    $position: caretAfter(text),
  };
}

/** Resolves a position at the end of a paragraph holding `text`, as if the caret sat there. */
function caretAfter(text: string) {
  const doc = PMNode.fromJSON(schema, {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  });
  return doc.resolve(1 + text.length);
}

beforeEach(() => {
  search.mockReset();
  search.mockResolvedValue([]);
});

/**
 * The `[[` trigger is two characters, which @tiptap/suggestion turns into a regex. Note
 * titles contain spaces, so the match also has to survive them. Both were reasoned about
 * when the extension was written and neither had ever actually been run.
 */
describe("the [[ trigger", () => {
  it("is configured as a two-character trigger that allows spaces", () => {
    const suggestion = suggestionOf("noteLink");
    expect(suggestion.char).toBe("[[");
    expect(suggestion.allowSpaces).toBe(true);
  });

  it("matches a multi-word title typed after [[", () => {
    const match = findSuggestionMatch(trigger("[[", true, "follow up in [[Site survey"));

    expect(match?.query).toBe("Site survey");
    expect(match?.text).toBe("[[Site survey");
  });

  it("matches at the very start of a paragraph", () => {
    const match = findSuggestionMatch(trigger("[[", true, "[[Kickoff"));

    expect(match?.query).toBe("Kickoff");
  });

  it("does not fire mid-word, so a stray bracket in prose is left alone", () => {
    const match = findSuggestionMatch(trigger("[[", true, "array[[0"));

    expect(match).toBeNull();
  });

  it("does not fire on a single bracket", () => {
    const match = findSuggestionMatch(trigger("[[", true, "see [Site"));

    expect(match).toBeNull();
  });
});

describe("the [[ menu items", () => {
  it("searches notes only, and strips a ]] the user closed by hand", async () => {
    const suggestion = suggestionOf("noteLink");

    await suggestion.items({ query: "Site survey]]" });

    expect(search).toHaveBeenCalledWith("Site survey", ["note"], 8);
  });

  it("offers to create the note when nothing matches", async () => {
    const createNote = vi.fn();
    const suggestion = suggestionOf("noteLink", { createNote });

    const items = await suggestion.items({ query: "Brand new page" });

    expect(items).toEqual([{ type: "create-note", title: "Brand new page" }]);
  });

  it("does not offer to create a note whose title already exists", async () => {
    search.mockResolvedValue([target({ label: "Site survey" })]);
    const suggestion = suggestionOf("noteLink", { createNote: vi.fn() });

    const items = await suggestion.items({ query: "site SURVEY" });

    expect(items).toEqual([{ type: "target", target: target({ label: "Site survey" }) }]);
  });

  it("still offers to create alongside partial matches", async () => {
    search.mockResolvedValue([target({ label: "Site survey 2025" })]);
    const suggestion = suggestionOf("noteLink", { createNote: vi.fn() });

    const items = (await suggestion.items({ query: "Site survey" })) as Array<{ type: string }>;

    expect(items.map((item) => item.type)).toEqual(["target", "create-note"]);
  });

  it("never offers to create when no creator is wired in (a read-only editor)", async () => {
    const suggestion = suggestionOf("noteLink");

    const items = await suggestion.items({ query: "Brand new page" });

    expect(items).toEqual([]);
  });
});

describe("the @ menu items", () => {
  it("searches every kind, capped per kind", async () => {
    const suggestion = suggestionOf("entityMention");

    await suggestion.items({ query: "acme" });

    expect(search).toHaveBeenCalledWith("acme", [], 4);
  });

  it("matches one word only, so '@' in prose cannot swallow the sentence", () => {
    const suggestion = suggestionOf("entityMention");
    expect(suggestion.allowSpaces).toBe(false);

    const match = findSuggestionMatch(trigger("@", false, "call @Jane about the roof"));

    // The caret is past the word, so nothing is being completed any more.
    expect(match).toBeNull();
  });

  it("matches while the word is still being typed", () => {
    const match = findSuggestionMatch(trigger("@", false, "call @Jan"));

    expect(match?.query).toBe("Jan");
  });
});
