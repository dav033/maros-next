"use client";

import Link from "next/link";
import { Briefcase, TrendingUp, FolderTree, StickyNote, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SharedEntityName } from "@/components/shared/SharedEntityName";
import { usePrefersReducedMotion } from "@/shared/presentation/hooks/usePrefersReducedMotion";
import { sharedEntityReturnTransition } from "@/shared/presentation/motionTransitions";
import { useRouteSharedLayoutScope } from "@/shared/presentation/RouteMotionContext";

export interface ContactLeadsSectionProps {
  leads: Array<{
    id: number;
    leadNumber?: string;
    name?: string;
    startDate?: string;
    location?: string;
    status?: string;
    notes?: string[];
    inReview: boolean;
    projectType?: {
      id: number;
      name: string;
    } | null;
    project?: {
      id: number;
      projectProgressStatus?: string;
      overview?: string;
      notes?: string[];
    } | null;
  }>;
  onCreateLead: () => void;
}

export function ContactLeadsSection({ leads, onCreateLead }: ContactLeadsSectionProps) {
  const shouldReduceMotion = usePrefersReducedMotion();
  const sharedLayoutScope = useRouteSharedLayoutScope();
  const projects = leads.filter(lead => lead.project);

  return (
    <div className="space-y-6">
      {/* Leads Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="size-5" />
            Leads
          </CardTitle>
          <CardDescription>
            {leads.length === 0
              ? "Este contacto no tiene leads asociados"
              : `${leads.length} ${leads.length === 1 ? "lead asociado" : "leads asociados"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                No hay leads asociados con este contacto
              </p>
              <Button variant="outline" onClick={onCreateLead}>
                <Plus className="size-4 mr-2" />
                Crear lead
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/lead/${lead.id}`}
                  className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Card className="border-l-4 border-l-primary bg-elev-3 transition-colors hover:bg-elev-4">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {lead.leadNumber && (
                              <span className="text-muted-foreground mr-2">#<SharedEntityName layoutId={`maros-lead-number-${lead.id}`}>{lead.leadNumber}</SharedEntityName></span>
                            )}
                            <SharedEntityName layoutId={`maros-lead-name-${lead.id}`}>
                              {lead.name || "No name"}
                            </SharedEntityName>
                          </CardTitle>
                          {lead.projectType && (
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <FolderTree className="size-3" />
                              {lead.projectType.name}
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {lead.status && <Badge variant="outline">{lead.status}</Badge>}
                          {lead.inReview && <Badge variant="secondary">En revisión</Badge>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {lead.startDate && (
                          <div>
                            <p className="text-muted-foreground">Fecha de inicio</p>
                            <p className="text-foreground">{new Date(lead.startDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        {lead.location && (
                          <div>
                            <p className="text-muted-foreground">Location</p>
                            <p className="text-foreground">{lead.location}</p>
                          </div>
                        )}
                      </div>
                      {Array.isArray(lead.notes) && lead.notes.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-muted-foreground text-sm mb-2 flex items-center gap-1">
                              <StickyNote className="size-3" />
                              Notas
                            </p>
                            <ul className="space-y-1">
                              {lead.notes.map((note, index) => (
                                <li key={index} className="text-sm text-foreground">
                                  • {note}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects Section */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5" />
              Proyectos
            </CardTitle>
            <CardDescription>
              {projects.length} {projects.length === 1 ? "proyecto asociado" : "proyectos asociados"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/project/${lead.project!.id}`}
                  className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Card
                    className="border-l-4 bg-elev-3 transition-colors hover:bg-elev-4"
                    // Color desde token CSS compartido (--badge-*), no paleta cruda: ver globals.css.
                    style={{ borderLeftColor: "hsl(var(--badge-green))" }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            <SharedEntityName
                              layoutId={shouldReduceMotion ? undefined : `maros-project-name-${lead.project!.id}-desktop-${sharedLayoutScope}`}
                              transition={sharedEntityReturnTransition}
                              className="hidden min-w-0 break-words xl:block"
                            >
                              {lead.name ?? "Unnamed project"}
                            </SharedEntityName>
                            <SharedEntityName
                              layoutId={shouldReduceMotion ? undefined : `maros-project-name-${lead.project!.id}-mobile-${sharedLayoutScope}`}
                              transition={sharedEntityReturnTransition}
                              className="block min-w-0 break-words xl:hidden"
                            >
                              {lead.name ?? "Unnamed project"}
                            </SharedEntityName>
                          </CardTitle>
                          {lead.projectType && (
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <FolderTree className="size-3" />
                              {lead.projectType.name}
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {lead.project?.projectProgressStatus && (
                            <Badge variant="outline">{lead.project.projectProgressStatus}</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {lead.project?.overview && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-muted-foreground text-sm mb-1">Resumen del proyecto</p>
                            <p className="text-foreground text-sm">{lead.project.overview}</p>
                          </div>
                        </>
                      )}
                      {Array.isArray(lead.project?.notes) && lead.project.notes.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-muted-foreground text-sm mb-2 flex items-center gap-1">
                              <StickyNote className="size-3" />
                              Notas
                            </p>
                            <ul className="space-y-1">
                              {lead.project.notes.map((note, index) => (
                                <li key={index} className="text-sm text-foreground">
                                  • {note}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
