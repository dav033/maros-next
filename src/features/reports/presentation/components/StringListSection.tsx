import { Button, Icon, IconButton, Textarea, Typography } from "@dav033/dav-components";

interface StringListSectionProps {
  title: string;
  items: string[];
  onUpdate: (index: number, value: string) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
  placeholder: string;
  itemLabel: (index: number) => string;
  emptyMessage: string;
}

export const StringListSection = ({
  title,
  items,
  onUpdate,
  onAdd,
  onDelete,
  placeholder,
  itemLabel,
  emptyMessage,
}: StringListSectionProps) => {
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
          Add
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={`item-${index}`} className="flex items-start gap-3">
            <div className="flex-1 space-y-2">
              <Typography variant="small" className="text-gray-300 font-medium">
                {itemLabel(index)}
              </Typography>
              <Textarea
                value={item}
                onChange={(e) => onUpdate(index, e.target.value)}
                placeholder={placeholder}
                rows={2}
                className="w-full resize-y"
              />
            </div>
            <IconButton
              aria-label="Delete item"
              variant="ghost"
              onClick={() => onDelete(index)}
              icon={<Icon name="mdi:delete" size={18} />}
              className="mt-6"
            />
          </div>
        ))}
        {items.length === 0 && (
          <Typography variant="small" className="text-gray-400">
            {emptyMessage}
          </Typography>
        )}
      </div>
    </section>
  );
};


