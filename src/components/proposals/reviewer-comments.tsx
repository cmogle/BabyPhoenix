"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { addComment } from "@/lib/actions/knowledge";
import { toast } from "sonner";
import { MessageSquare, Send } from "lucide-react";
import { PROPOSAL_FIELDS } from "@/lib/types";

type Comment = {
  id: string;
  userEmail: string;
  content: string;
  field: string | null;
  createdAt: Date;
};

type Props = {
  proposalId: string;
  comments: Comment[];
};

export function ReviewerComments({
  proposalId,
  comments: initialComments,
}: Props) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await addComment(proposalId, newComment.trim());
      setComments((prev) => [
        {
          id: crypto.randomUUID(),
          userEmail: "You",
          content: newComment.trim(),
          field: null,
          createdAt: new Date(),
        },
        ...prev,
      ]);
      setNewComment("");
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  }

  function formatTime(date: Date) {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          Reviewer Comments
          {comments.length > 0 && (
            <Badge variant="outline" className="ml-1">
              {comments.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add feedback for the submitter..."
            rows={2}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) handleSubmit();
            }}
          />
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || !newComment.trim()}
            className="self-end"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>

        {comments.length > 0 && <Separator />}

        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="text-sm">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-medium text-xs">
                  {comment.userEmail}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(comment.createdAt)}
                </span>
                {comment.field && (
                  <Badge variant="outline" className="text-[10px] h-4">
                    {PROPOSAL_FIELDS[
                      comment.field as keyof typeof PROPOSAL_FIELDS
                    ] ?? comment.field}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{comment.content}</p>
            </div>
          ))}
        </div>

        {comments.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            No comments yet. Add feedback to help the submitter improve.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
