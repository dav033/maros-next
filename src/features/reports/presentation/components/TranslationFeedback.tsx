import { Loader } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface TranslationFeedbackProps {
  isTranslating: boolean;
  progress: {
    current: string;
    total: number;
    completed: number;
  } | null;
}

export const TranslationFeedback = ({
  isTranslating,
  progress,
}: TranslationFeedbackProps) => {
  if (!isTranslating) return null;

  const percentage = progress
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <Card className="fixed bottom-6 right-6 z-50 min-w-[320px] max-w-md animate-in slide-in-from-bottom-5 shadow-2xl">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Loader className="size-4 animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground mb-1">
              Translating content...
            </p>
            {progress && (
              <>
                <p className="text-sm text-muted-foreground mb-2 truncate">
                  {progress.current}
                </p>
                <Progress value={percentage} className="h-2 mb-1" />
                <p className="text-xs text-muted-foreground">
                  {progress.completed} of {progress.total} sections
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

