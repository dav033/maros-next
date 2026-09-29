import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  FolderKanban,
  Users,
  Building,
  UserCog,
  LayoutDashboard,
  XCircle,
  CheckCircle2,
  NotebookPen,
  ShieldCheck,
  Globe,
  KanbanSquare,
  BellRing,
  Receipt,
  Camera,
  CalendarDays,
  Video,
  ArrowDownToLine,
  Plug,
} from "lucide-react";
import type { Permission } from "@/shared/auth/permissions";

export type SidebarItemProps = {
  title: string;
  href: string;
  icon?: LucideIcon;
  /** Prefijo de ruta que marca el link como activo (además del href exacto). */
  activePrefix?: string;
  /** Prefijos excluidos del match de activePrefix (ej. /leads/lost). */
  activeExclude?: string[];
  /** Oculto si el usuario no tiene este permiso. Sin valor = visible para cualquiera autenticado. */
  permission?: Permission;
};

export type SidebarDropdownProps = {
  trigger: {
    title: string;
    icon?: LucideIcon;
  };
  items: SidebarDropdownConfig[];
};

export type SidebarDropdownConfig = SidebarItemProps | SidebarDropdownProps;

export type SidebarSection = {
  section: string;
  items: SidebarDropdownConfig[];
};

export type SidebarConfig = {
  top: Array<SidebarDropdownConfig | SidebarSection>;
  bottom?: Array<SidebarDropdownConfig | SidebarSection>;
  title?: string;
};

// Grupos por naturaleza del trabajo, no por "cosas del negocio": el embudo
// comercial (Sales), la ejecución de obra (Projects), el trabajo propio del
// usuario (Workspace) y las herramientas de integración (Integrations) son
// cuatro dominios distintos que antes convivían en un único cajón "Business".

// Leads es un solo link: el cambio de tipo (construction/roofing/plumbing) se
// hace dentro de la página con su switcher.
const salesSection: SidebarSection = {
  section: "Sales",
  items: [
    {
      title: "Leads",
      href: "/leads/construction",
      icon: Briefcase,
      activePrefix: "/leads",
      activeExclude: ["/leads/lost"],
      permission: "leads:read",
    },
    {
      title: "Lost Leads",
      href: "/leads/lost",
      icon: XCircle,
      permission: "leads:read",
    },
  ],
};

// Projects es un solo link: el cambio de tipo vive en su propio switcher, y
// "Import from QuickBooks" es una pestaña de esta misma página (no un hermano).
const projectsSection: SidebarSection = {
  section: "Projects",
  items: [
    {
      title: "Projects",
      href: "/projects/construction",
      icon: FolderKanban,
      activePrefix: "/projects",
      activeExclude: ["/projects/completed", "/projects/lost", "/projects/import-from-quickbooks"],
      permission: "projects:read",
    },
    {
      title: "Completed Projects",
      href: "/projects/completed",
      icon: CheckCircle2,
      permission: "projects:read",
    },
    {
      title: "Lost Projects",
      href: "/projects/lost",
      icon: XCircle,
      permission: "projects:read",
    },
  ],
};

// Lo que el usuario hace, no lo que el negocio vende ni lo que ejecuta:
// tareas, sus tableros, notas y su agenda.
const workspaceSection: SidebarSection = {
  section: "Workspace",
  items: [
    {
      title: "Tasks",
      href: "/tasks",
      icon: KanbanSquare,
      activePrefix: "/tasks",
      permission: "tasks:read",
    },
    {
      title: "Task workspaces",
      href: "/tasks/workspaces",
      icon: FolderKanban,
      activePrefix: "/tasks/workspaces",
      permission: "tasks:read",
    },
    {
      title: "Notes",
      href: "/notes",
      icon: NotebookPen,
      activePrefix: "/notes",
      permission: "notes:read",
    },
    { title: "Calendar", href: "/calendar", icon: CalendarDays },
    { title: "Start Meet", href: "/meet", icon: Video },
  ],
};

const directorySection: SidebarSection = {
  section: "Directory",
  items: [
    {
      title: "Contacts",
      href: "/contacts",
      icon: Users,
      permission: "contacts:read",
    },
    {
      title: "Company",
      href: "/company",
      icon: Building,
      permission: "companies:read",
    },
    {
      title: "Customers",
      href: "/customers",
      icon: UserCog,
      permission: "companies:read",
    },
  ],
};

// Dashboard es un solo link: el filtro por tipo de lead vive en la propia
// página (DashboardFiltersBar).
const analyticsSection: SidebarSection = {
  section: "Analytics",
  items: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      permission: "dashboard:read",
    },
  ],
};

// Puentes con sistemas externos: conectar QuickBooks y traer datos desde él.
const integrationsSection: SidebarSection = {
  section: "Integrations",
  items: [
    {
      title: "QuickBooks",
      href: "/settings/quickbooks",
      icon: Plug,
      permission: "finance:read",
    },
    {
      title: "Import from QuickBooks",
      href: "/projects/import-from-quickbooks",
      icon: ArrowDownToLine,
      permission: "projects:read",
    },
  ],
};

const settingsSection: SidebarSection = {
  section: "Settings",
  items: [
    {
      title: "Users",
      href: "/settings/users",
      icon: Users,
      permission: "users:read",
    },
    {
      title: "Roles",
      href: "/settings/roles",
      icon: ShieldCheck,
      permission: "users:read",
    },
    {
      title: "Public links",
      href: "/settings/public-links",
      icon: Globe,
      permission: "users:write",
    },
    {
      title: "Notifications",
      href: "/settings/notifications",
      icon: BellRing,
    },
  ],
};

const financeSection: SidebarSection = {
  section: "Finance",
  items: [
    {
      title: "Invoice scans",
      href: "/finance/invoices",
      icon: Receipt,
      activePrefix: "/finance/invoices",
      activeExclude: ["/finance/invoices/scan"],
      permission: "finance:write",
    },
    {
      title: "Scan invoice",
      href: "/finance/invoices/scan",
      icon: Camera,
      permission: "finance:write",
    },
  ],
};

export const SIDEBAR_CONFIG: SidebarConfig = {
  title: "Maros Construction",
  top: [
    analyticsSection,
    salesSection,
    projectsSection,
    workspaceSection,
    directorySection,
    financeSection,
    integrationsSection,
    settingsSection,
  ],
  bottom: [],
};

export function getMainPages() {
  const pages: Array<{ title: string; href: string; icon?: LucideIcon }> = [];

  const extractPages = (entries: Array<SidebarDropdownConfig | SidebarSection>) => {
    for (const entry of entries) {
      if ("section" in entry) {
        extractPages(entry.items);
        continue;
      }
      if ("trigger" in entry) {
        extractPages(entry.items);
      } else {
        pages.push({
          title: entry.title,
          href: entry.href,
          icon: entry.icon,
        });
      }
    }
  };

  extractPages(SIDEBAR_CONFIG.top);
  if (SIDEBAR_CONFIG.bottom) {
    extractPages(SIDEBAR_CONFIG.bottom);
  }

  return pages;
}

export function getAllRoutes(): string[] {
  return getMainPages().map((page) => page.href);
}
