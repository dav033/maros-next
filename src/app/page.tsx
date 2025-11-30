export default function Page() {
  const pages = [
    { name: "Companies", path: "/company" },
    { name: "Contacts", path: "/contacts" },
    { name: "Customers", path: "/customers" },
    { name: "Construction Leads", path: "/leads/construction" },
    { name: "Plumbing Leads", path: "/leads/plumbing" },
    { name: "Roofing Leads", path: "/leads/roofing" },
  ];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-theme-dark text-theme-light">
      <h1 className="text-3xl font-bold mb-6">Available Categories</h1>
      <ul className="w-full max-w-md space-y-4">
        {pages.map((page) => (
          <li key={page.path} className="rounded-lg border border-theme-gray-subtle bg-theme-dark/70 hover:bg-theme-dark/90 transition-colors">
            <a
              href={page.path}
              className="block px-6 py-4 text-lg font-medium text-theme-light hover:text-theme-accent"
            >
              {page.name}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
