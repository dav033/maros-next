
import { getMainPages } from "@/components/sidebar/sidebarConfig";

export default function Page() {
  const pages = getMainPages();

  return (
    <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 max-w-screen-2xl px-4">
      <h1 className="text-2xl font-bold text-center mb-8 text-foreground">
        Available Categories
      </h1>
      <ul className="w-full max-w-md space-y-4 mx-auto">
        {pages.map((page) => (
          <li key={page.href} className="rounded-lg border border-border bg-background/70 hover:bg-background/90 transition-colors">
            <a
              href={page.href}
              className="block px-6 py-4 text-lg font-medium text-foreground hover:text-primary"
            >
              {page.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
