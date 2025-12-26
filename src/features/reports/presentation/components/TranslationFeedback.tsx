import { Spinner, Typography } from "@dav033/dav-components";

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
    <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#1d1d1f] border border-gray-700 shadow-2xl p-4 min-w-[320px] max-w-md animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Spinner size="sm" />
        </div>
        <div className="flex-1 min-w-0">
          <Typography
            variant="small"
            className="font-semibold text-theme-light mb-1"
          >
            Translating content...
          </Typography>
          {progress && (
            <>
              <Typography
                variant="small"
                className="text-gray-400 mb-2 truncate"
              >
                {progress.current}
              </Typography>
              <div className="w-full bg-gray-800 rounded-full h-2 mb-1">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <Typography variant="small" className="text-gray-500 text-xs">
                {progress.completed} of {progress.total} sections
              </Typography>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

