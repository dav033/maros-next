import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { NotePageSummary } from "@/notes/domain";
import { NotesHomeView } from "./NotesHomeView";
import { NoteFolderView } from "./NoteFolderView";
import { onNoteContentSearch } from "../organisms/noteSearchBus";

afterEach(cleanup);

const base: NotePageSummary = {
  id: 1,
  parentId: null,
  kind: "page",
  title: "Zoning decisions",
  icon: null,
  position: 0,
  isFavorite: false,
  visibility: "private",
  isShared: false,
  isPublished: false,
  entityKind: null,
  entityId: null,
  ownerId: 1,
  deletedAt: null,
  createdAt: "2026-09-01T12:00:00Z",
  updatedAt: "2026-09-05T12:00:00Z",
  lastEditedBy: null,
  tags: [{ id: 1, name: "Planning", color: "blue" }],
};
const pages = [
  base,
  {
    ...base,
    id: 2,
    title: "Archive",
    kind: "folder" as const,
    tags: [],
    updatedAt: "2026-09-01T12:00:00Z",
  },
];

describe("Notes home", () => {
  it("shows recent pages first and supports alphabetical sorting", async () => {
    const user = userEvent.setup();
    render(
      <NotesHomeView
        pages={pages}
        onCreate={vi.fn()}
        onSetFavorite={vi.fn()}
      />,
    );
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", "/notes/1");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Sort pages" }),
      "name",
    );
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", "/notes/2");
    expect(pages[0].id).toBe(1);
  });

  it("filters by labels and page type, and recovers from no results", async () => {
    const user = userEvent.setup();
    render(
      <NotesHomeView
        pages={pages}
        onCreate={vi.fn()}
        onSetFavorite={vi.fn()}
      />,
    );
    await user.type(
      screen.getByRole("textbox", { name: "Filter pages by title or label" }),
      "planning",
    );
    expect(screen.getAllByRole("link")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Folders" }));
    expect(screen.getByText("No matching pages")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("creates the requested kind and favorites a page without opening it", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    const onSetFavorite = vi.fn();
    render(
      <NotesHomeView
        pages={pages}
        onCreate={onCreate}
        onSetFavorite={onSetFavorite}
      />,
    );
    await user.click(screen.getByRole("button", { name: "New folder" }));
    expect(onCreate).toHaveBeenCalledWith("folder");
    await user.click(screen.getByRole("button", { name: "New page" }));
    expect(onCreate).toHaveBeenCalledWith("page");
    await user.click(
      screen.getByRole("button", { name: "Add Zoning decisions to favorites" }),
    );
    expect(onSetFavorite).toHaveBeenCalledWith(1, true);
  });

  it("hands an unmatched query to the full-text search instead of dead-ending", async () => {
    const user = userEvent.setup();
    const seen: string[] = [];
    const stop = onNoteContentSearch((query) => seen.push(query));
    render(
      <NotesHomeView pages={pages} onCreate={vi.fn()} onSetFavorite={vi.fn()} />,
    );
    await user.type(
      screen.getByRole("textbox", { name: "Filter pages by title or label" }),
      "scaffolding",
    );
    expect(screen.getByText("No matching pages")).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Search inside notes" }),
    );
    expect(seen).toEqual(["scaffolding"]);
    stop();
  });

  it("marks a page with no title as a placeholder rather than a name", () => {
    render(
      <NotesHomeView
        pages={[{ ...base, id: 9, title: "", tags: [] }]}
        onCreate={vi.fn()}
        onSetFavorite={vi.fn()}
      />,
    );
    expect(screen.getByText("Untitled")).toHaveClass("italic");
  });

  it("offers no content search when nothing was typed", async () => {
    const user = userEvent.setup();
    render(
      <NotesHomeView pages={pages} onCreate={vi.fn()} onSetFavorite={vi.fn()} />,
    );
    await user.click(screen.getByRole("button", { name: "Folders" }));
    await user.click(screen.getByRole("button", { name: "Pages" }));
    await user.type(
      screen.getByRole("textbox", { name: "Filter pages by title or label" }),
      "   ",
    );
    expect(
      screen.queryByRole("button", { name: "Search inside notes" }),
    ).not.toBeInTheDocument();
  });

  it("disables creation while a page is being created", () => {
    render(
      <NotesHomeView
        pages={[]}
        onCreate={vi.fn()}
        onSetFavorite={vi.fn()}
        creating
      />,
    );
    expect(
      screen.getByRole("button", { name: "Create your first page" }),
    ).toBeDisabled();
  });
});

it("does not offer creation inside a read-only folder", () => {
  render(
    <NoteFolderView
      folderId={2}
      pages={pages}
      onCreateChild={vi.fn()}
      canEdit={false}
    />,
  );
  expect(
    screen.queryByRole("button", { name: "New page" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "New folder" }),
  ).not.toBeInTheDocument();
  expect(screen.getByText("This folder has no pages yet.")).toBeVisible();
});
