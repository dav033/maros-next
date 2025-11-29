export type SidebarItemProps = {
  title: string;
  href: string;
  icon?: string;
};

export type SidebarDropdownProps = {
  trigger: {
    title: string;
    icon?: string;
  };
  items: SidebarDropdownConfig[];
};

export type SidebarDropdownConfig = SidebarItemProps | SidebarDropdownProps;
