"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Briefcase, Building2, FolderKanban, UserRound } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInstantContacts } from "@/features/contact/presentation/hooks";
import { useInstantCompanies } from "@/features/company/presentation/hooks";
import type { NoteEntityKind, NoteEntityLink } from "@/notes/domain";
import { useNoteLinkableRecords } from "../hooks/data/useNoteLinkableRecords";

type PickerTab = NoteEntityKind;

const ENTITY_TABS: Array<{ value: PickerTab; label: string; icon: typeof Briefcase }> = [
  { value: "lead", label: "Leads", icon: Briefcase },
  { value: "project", label: "Projects", icon: FolderKanban },
  { value: "contact", label: "Contacts", icon: UserRound },
  { value: "company", label: "Companies", icon: Building2 },
];

export function NoteEntityPicker({
  trigger,
  onSelect,
}: {
  trigger: ReactNode;
  onSelect: (link: NoteEntityLink) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PickerTab>("lead");

  // Both lists load only once the popover opens: the notes workspace shouldn't pay
  // for the whole pipeline on every page view.
  const recordsQuery = useNoteLinkableRecords(open);
  const contactsQuery = useInstantContacts(undefined, { enabled: open });
  const companiesQuery = useInstantCompanies(undefined, { enabled: open });

  // A notes page may be open for a while, while leads and projects are changed in a
  // different tab. Refresh on opening rather than trusting an empty cached list — the
  // picker should never look empty merely because its first background request raced.
  useEffect(() => {
    if (!open) return;
    void recordsQuery.refetch();
    void contactsQuery.refetch();
    void companiesQuery.refetch();
  }, [open]);

  const leads = recordsQuery.leads;
  const projects = recordsQuery.projects;
  const contacts = contactsQuery.contacts;
  const companies = companiesQuery.companies;
  const activeQuery =
    tab === "lead" || tab === "project"
      ? recordsQuery
        : tab === "contact"
          ? contactsQuery
          : companiesQuery;

  const choose = (entityKind: PickerTab, entityId: number) => {
    onSelect({ entityKind, entityId });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Tabs value={tab} onValueChange={(value) => setTab(value as PickerTab)}>
          <TabsList className="grid w-full grid-cols-4 rounded-none border-b bg-transparent p-0">
            {ENTITY_TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className="gap-1 text-xs">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Command>
          <CommandInput placeholder={`Search ${tab}s…`} />
          <CommandList>
            <CommandEmpty>
              {activeQuery.isLoading || activeQuery.isFetching
                ? "Loading records…"
                : activeQuery.error
                  ? "Couldn’t load records. Try again."
                  : "No matches."}
            </CommandEmpty>
            {tab === "lead" ? (
              <CommandGroup>
                {(leads ?? []).map((lead) => (
                  <CommandItem
                    key={lead.id}
                    // cmdk filters on `value`, so the lead number has to be part of
                    // it — searching "L-1042" is how the office finds a lead.
                    value={`${lead.leadNumber ?? ""} ${lead.name}`}
                    onSelect={() => choose("lead", lead.id)}
                  >
                    <span className="truncate">{lead.name}</span>
                    {lead.leadNumber && (
                      <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                        {lead.leadNumber}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : tab === "project" ? (
              <CommandGroup>
                {(projects ?? []).map((project) => (
                  <CommandItem
                    key={project.id}
                    value={`${project.leadNumber ?? ""} ${project.name}`}
                    onSelect={() => choose("project", project.id)}
                  >
                    <span className="truncate">
                      {project.name}
                    </span>
                    {project.leadNumber && (
                      <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                        {project.leadNumber}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : tab === "contact" ? (
              <CommandGroup>
                {(contacts ?? []).filter((contact) => contact.id != null).map((contact) => (
                  <CommandItem
                    key={contact.id}
                    value={`${contact.name} ${contact.email ?? ""} ${contact.phone ?? ""}`}
                    onSelect={() => choose("contact", contact.id!)}
                  >
                    <span className="truncate">{contact.name}</span>
                    {contact.email && <span className="ml-auto truncate text-xs text-muted-foreground">{contact.email}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandGroup>
                {(companies ?? []).map((company) => (
                  <CommandItem
                    key={company.id}
                    value={`${company.name} ${company.email ?? ""} ${company.phone ?? ""}`}
                    onSelect={() => choose("company", company.id)}
                  >
                    <span className="truncate">{company.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
