import Link from "next/link";
import { Icon } from "@dav033/dav-components";
import { PageContainer } from "@dav033/dav-components";

export default function NotFound() {
  return (
    <PageContainer centered>
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <Icon name="mdi:alert-circle-outline" className="text-9xl text-theme-light/20" />
        </div>
        
        <h1 className="mb-4 text-6xl font-bold text-theme-light">404</h1>
        
        <h2 className="mb-4 text-2xl font-semibold text-theme-light">
          Page not found
        </h2>
        
        <p className="mb-8 text-theme-light/70">
          The page you are looking for does not exist or has been moved.
        </p>
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-theme-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-theme-primary/90"
        >
          <Icon name="mdi:home-outline" className="text-lg" />
          Back to home
        </Link>
      </div>
    </PageContainer>
  );
}
