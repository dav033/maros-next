"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { textToTipTapDoc, tiptapDocToText } from "@/shared/domain";
import { useCurrentUser } from "@/shared/auth/CurrentUserProvider";
import type { TaskComment } from "@/tasks/domain";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";

export function TaskCommentList({
  taskId,
  comments,
}: {
  taskId: number;
  comments: TaskComment[];
}) {
  const { user, hasPermission } = useCurrentUser();
  const canModerate = hasPermission("tasks:delete");

  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const { addCommentMutation, updateCommentMutation, deleteCommentMutation } = useTaskMutations();

  const submit = async () => {
    if (!draft.trim()) return;
    await addCommentMutation.mutateAsync({ taskId, body: textToTipTapDoc(draft.trim()) });
    setDraft("");
  };

  const startEdit = (comment: TaskComment) => {
    setEditingId(comment.id);
    setEditingText(tiptapDocToText(comment.body));
  };

  const saveEdit = async (commentId: number) => {
    if (!editingText.trim()) return;
    await updateCommentMutation.mutateAsync({
      taskId,
      commentId,
      body: textToTipTapDoc(editingText.trim()),
    });
    setEditingId(null);
  };

  // Mirrors the backend's own rule — see TaskCommentsService.getOwned.
  const canEdit = (comment: TaskComment) => canModerate || comment.author?.id === user?.id;

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
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
                  <Textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    rows={2}
                    autoFocus
                  />
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      className="h-7 gap-1"
                      disabled={!editingText.trim() || updateCommentMutation.isPending}
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
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground/90">
                  {tiptapDocToText(comment.body)}
                </p>
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
      </ul>

      <div className="space-y-1.5 border-t border-border/60 pt-3">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a comment…"
          rows={2}
        />
        <Button
          type="button"
          size="sm"
          disabled={!draft.trim() || addCommentMutation.isPending}
          onClick={() => void submit()}
        >
          Comment
        </Button>
      </div>
    </div>
  );
}
