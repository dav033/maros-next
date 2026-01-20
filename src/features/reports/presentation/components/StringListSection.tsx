import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash } from "lucide-react";

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
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={`item-${index}`} className="flex items-start gap-3">
            <div className="flex-1 space-y-2">
              <p className="text-sm text-muted-foreground font-medium">
                {itemLabel(index)}
              </p>
              <Textarea
                value={item}
                onChange={(e) => onUpdate(index, e.target.value)}
                placeholder={placeholder}
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
              aria-label="Delete item"
            >
              <Trash className="size-4.5" />
            </Button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
};


