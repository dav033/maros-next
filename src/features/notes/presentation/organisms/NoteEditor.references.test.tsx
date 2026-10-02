import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NoteEditor } from "./NoteEditor";
import { NoteReadOnlyView } from "./NoteReadOnlyView";

afterEach(cleanup);

// The upload hook reaches for presigned S3 URLs on mount; the editor is under test here,
// not the image pipeline.
vi.mock("../hooks/editor/useNoteImageUpload", () => ({
  useNoteImageUpload: () => vi.fn(),
}));

const docWithReferences = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Walk the roof with " },
        { type: "entityMention", attrs: { kind: "contact", id: 3, label: "Jane Doe" } },
        { type: "text", text: " for " },
        { type: "entityMention", attrs: { kind: "lead", id: 42, label: "Acme roof" } },
        { type: "text", text: ", see " },
        { type: "noteLink", attrs: { kind: "note", id: 7, label: "Site survey" } },
      ],
    },
  ],
};

/**
 * Both reference nodes come from the same Mention base and each registers its own
 * ProseMirror suggestion plugin. Two plugins sharing one key is how ProseMirror throws on
 * init, and two nodes sharing one name is how one of them silently renders as the other —
 * neither would show up in a unit test of the extension alone, only in an editor that
 * actually mounts both.
 */
describe("NoteEditor reference nodes", () => {
  it("renders an @mention and a [[wikilink]] as chips in the same paragraph", async () => {
    render(
      <NoteEditor pageId={1} initialContent={docWithReferences} onChange={vi.fn()} />
    );

    expect(await screen.findByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Acme roof")).toBeInTheDocument();
    expect(screen.getByText("Site survey")).toBeInTheDocument();
  });

  it("links each chip at its own record", async () => {
    render(
      <NoteEditor pageId={1} initialContent={docWithReferences} onChange={vi.fn()} />
    );

    expect((await screen.findByText("Jane Doe")).closest("a")).toHaveAttribute(
      "href",
      "/contact/3"
    );
    expect(screen.getByText("Acme roof").closest("a")).toHaveAttribute("href", "/lead/42");
    expect(screen.getByText("Site survey").closest("a")).toHaveAttribute("href", "/notes/7");
  });

  it("keeps the surrounding sentence intact", async () => {
    render(
      <NoteEditor pageId={1} initialContent={docWithReferences} onChange={vi.fn()} />
    );

    await screen.findByText("Jane Doe");
    expect(screen.getByText(/Walk the roof with/)).toBeInTheDocument();
  });
});

/**
 * The public reader shares the node list but gets a document whose targets were stripped
 * server-side (NoteMapper.toPublicDto). The chips have to survive that: text, no link.
 */
describe("NoteReadOnlyView with stripped references", () => {
  const stripped = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Quoted for " },
          { type: "entityMention", attrs: { kind: null, id: null, label: "Acme roof" } },
        ],
      },
    ],
  };

  it("shows the chip text with nothing to click", async () => {
    render(<NoteReadOnlyView content={stripped} />);

    const chip = await screen.findByText("Acme roof");
    expect(chip).toBeInTheDocument();
    expect(chip.closest("a")).toBeNull();
  });
});
