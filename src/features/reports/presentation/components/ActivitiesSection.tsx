import { Button, Icon, IconButton, Textarea, Typography } from "@dav033/dav-components";
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
    <section className="rounded-2xl bg-[#1d1d1f] p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Typography variant="body" className="font-semibold text-theme-light">
          {title}
        </Typography>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          leftIcon={<Icon name="mdi:plus" size={16} />}
          onClick={onAdd}
        >
          Add Activity
        </Button>
      </div>

      <div className="space-y-4">
        {activities.map((row, index) => (
          <div
            key={`activity-${index}`}
            className="rounded-xl bg-[#18181b] p-5 space-y-4 border border-gray-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <Typography variant="small" className="text-gray-300 font-medium">
                  {activityLabel(index)}
                </Typography>
                <Textarea
                  value={row.activity}
                  onChange={(e) => onUpdate(index, { activity: e.target.value })}
                  placeholder="Describe the activity..."
                  rows={2}
                  className="w-full resize-y"
                />
              </div>
              <IconButton
                aria-label="Delete activity"
                variant="ghost"
                onClick={() => onDelete(index)}
                icon={<Icon name="mdi:delete" size={18} />}
                className="mt-6"
              />
            </div>

            <div className="pt-2 border-t border-gray-800">
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
          </div>
        ))}
        {activities.length === 0 && title === "Additional Activities" && (
          <Typography variant="small" className="text-gray-400">
            No additional activities registered.
          </Typography>
        )}
      </div>
    </section>
  );
};


