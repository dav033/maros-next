import { getMainPages } from "@/components/sidebar/sidebarConfig";
import { PageContainer } from "@dav033/dav-components";
import { Example } from "@dav033/dav-components";

export default function Page() {
  const pages = getMainPages();

  return (
    <PageContainer 
      centered 
      title="Available Categories"
      className="px-4"
    >

      <div>
        <Example />
      </div>
      <ul className="w-full max-w-md space-y-4 mx-auto">
        {pages.map((page) => (
          <li key={page.href} className="rounded-lg border border-theme-gray-subtle bg-theme-dark/70 hover:bg-theme-dark/90 transition-colors">
            <a
              href={page.href}
              className="block px-6 py-4 text-lg font-medium text-theme-light hover:text-theme-accent"
            >
              {page.title}
            </a>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
