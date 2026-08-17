"use client";

import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/shared/auth/CurrentUserProvider";
import type { TaskComment } from "@/tasks/domain";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";
import { TaskRichTextEditor } from "../molecules/TaskRichTextEditor";
import { isBlankDoc } from "../molecules/taskRichTextDoc";

const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

export function TaskCommentList({
  taskId,
  comments,
  showComments = true,
}: {
  taskId: number;
  comments: TaskComment[];
  /** The merged task timeline already renders the comment entries. */
  showComments?: boolean;
}) {
  const { user, hasPermission } = useCurrentUser();
  const canModerate = hasPermission("tasks:delete");

  const [editingId, setEditingId] = useState<number | null>(null);
  const { addCommentMutation, updateCommentMutation, deleteCommentMutation } = useTaskMutations();

  // The composer's own draft, kept only so "Comment" can be disabled while it's
  // blank — TaskRichTextEditor itself is uncontrolled (see its own doc comment).
  const draftRef = useRef<Record<string, unknown>>(EMPTY_DOC);
  const [draftEmpty, setDraftEmpty] = useState(true);
  const [composerKey, setComposerKey] = useState(0);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key !== "Enter") return;
      const target = event.target as HTMLElement | null;
      if (!target?.isContentEditable) return;
      event.preventDefault();
      document.querySelector<HTMLButtonElement>("[data-task-comment-submit]")?.click();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const editDraftRef = useRef<Record<string, unknown>>(EMPTY_DOC);

  const submit = async () => {
    if (draftEmpty) return;
    await addCommentMutation.mutateAsync({ taskId, body: draftRef.current });
    // Remounts the composer with a fresh empty doc — there's no imperative "clear"
    // on an uncontrolled TipTap instance short of replacing it.
    draftRef.current = EMPTY_DOC;
    setDraftEmpty(true);
    setComposerKey((k) => k + 1);
  };

  const startEdit = (comment: TaskComment) => {
    editDraftRef.current = comment.body;
    setEditingId(comment.id);
  };

  const saveEdit = async (commentId: number) => {
    await updateCommentMutation.mutateAsync({
      taskId,
      commentId,
      body: editDraftRef.current,
    });
    setEditingId(null);
  };

  // Mirrors the backend's own rule — see TaskCommentsService.getOwned.
  const canEdit = (comment: TaskComment) => canModerate || comment.author?.id === user?.id;

  return (
    <div className="space-y-4">
      {showComments ? <ul className="space-y-3">
        {comments.map((comment) => (
          <li key={comment.id} className="flex gap-2.5">
            <AssigneeAvatar person={comment.author} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {comment.author?.name ?? comment.author?.email ?? "Someone"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>

              {editingId === comment.id ? (
                <div className="mt-1 space-y-1.5">
                  <TaskRichTextEditor
                    content={comment.body}
                    mentionable
                    autoFocus
                    minHeightClassName="min-h-[50px]"
                    onUpdate={(doc) => {
                      editDraftRef.current = doc;
                    }}
                  />
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      className="h-7 gap-1"
                      disabled={updateCommentMutation.isPending}
                      onClick={() => void saveEdit(comment.id)}
                    >
                      <Check className="h-3 w-3" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-3 w-3" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-0.5 text-sm text-foreground/90">
                  <TaskRichTextEditor content={comment.body} editable={false} mentionable />
                </div>
              )}

              {canEdit(comment) && editingId !== comment.id && (
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(comment)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCommentMutation.mutate({ taskId, commentId: comment.id })}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
        {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
      </ul> : null}

      <div className="space-y-1.5 border-t border-border/60 pt-3">
        <TaskRichTextEditor
          key={composerKey}
          content={EMPTY_DOC}
          mentionable
          placeholder="Add a comment… (@ to mention someone)"
          minHeightClassName="min-h-[60px]"
          onUpdate={(doc) => {
            draftRef.current = doc;
            setDraftEmpty(isBlankDoc(doc));
          }}
        />
        <Button
          type="button"
          size="sm"
          data-task-comment-submit
          disabled={draftEmpty || addCommentMutation.isPending}
          onClick={() => void submit()}
        >
          Comment
        </Button>
      </div>
    </div>
  );
}
