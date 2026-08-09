export default function PublicNoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/*
        The token lives in this page's URL, and a Referer header carries the whole URL
        to every external resource the page touches. Suppressing it is the difference
        between a private link and one that leaks to any third party the content
        happens to reference.
      */}
      <meta name="referrer" content="no-referrer" />
      <div className="min-h-svh bg-background text-foreground">{children}</div>
    </>
  );
}
