import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash } from "lucide-react";
import { FileInputList } from "./FileInputList";
import type { ActivityRow } from "@/reports/domain/models";

interface ActivitiesSectionProps {
  title: string;
  activities: ActivityRow[];
  onUpdate: (index: number, data: Partial<ActivityRow>) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
  activityLabel?: (index: number) => string;
}

export const ActivitiesSection = ({
  title,
  activities,
  onUpdate,
  onAdd,
  onDelete,
  activityLabel = (index) => `Activity ${index + 1}`,
}: ActivitiesSectionProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onAdd}
        >
          <Plus className="size-4 mr-2" />
          Add Activity
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((row, index) => (
          <Card key={`activity-${index}`} className="bg-background">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">
                    {activityLabel(index)}
                  </p>
                  <Textarea
                    value={row.activity}
                    onChange={(e) => onUpdate(index, { activity: e.target.value })}
                    placeholder="Describe the activity..."
                    rows={2}
                    className="w-full resize-y"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(index)}
                  className="mt-6 text-muted-foreground hover:text-destructive"
                  aria-label="Delete activity"
                >
                  <Trash className="size-4.5" />
                </Button>
              </div>

              <div className="pt-2 border-t border-border">
                <FileInputList
                  label="Add Images"
                  files={row.imageFiles ?? []}
                  existingUrls={row.imageUrls ?? []}
                  onChange={(files) => onUpdate(index, { imageFiles: files })}
                  onRemoveExisting={(url) =>
                    onUpdate(index, {
                      imageUrls: (row.imageUrls ?? []).filter((item) => item !== url),
                    })
                  }
                  helperText="Formats: images or PDF."
                />
              </div>
            </CardContent>
          </Card>
        ))}
        {activities.length === 0 && title === "Additional Activities" && (
          <p className="text-sm text-muted-foreground">
            No additional activities registered.
          </p>
        )}
      </CardContent>
    </Card>
  );
};


