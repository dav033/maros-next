"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
              ? "This contact has no associated leads"
              : `${leads.length} lead(s) associated`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                No leads associated with this contact
              </p>
              <Button variant="outline" onClick={onCreateLead}>
                <Plus className="size-4 mr-2" />
                Create Lead
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <Card 
                  key={lead.id} 
                  className="border-l-4 border-l-primary cursor-pointer hover:bg-accent/30 transition-colors"
                  onClick={() => router.push(`/lead/${lead.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {lead.leadNumber && (
                            <span className="text-muted-foreground mr-2">#{lead.leadNumber}</span>
                          )}
                          {lead.name || "No name"}
                        </CardTitle>
                        {lead.projectType && (
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <FolderTree className="size-3" />
                            {lead.projectType.name}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {lead.status && (
                          <Badge variant="outline">{lead.status}</Badge>
                        )}
                        {lead.inReview && (
                          <Badge variant="secondary">In Review</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {lead.startDate && (
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
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
                            Notes
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
              Projects
            </CardTitle>
            <CardDescription>
              {projects.length} project(s) associated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map((lead) => (
                <Card 
                  key={lead.id} 
                  className="border-l-4 border-l-green-500 cursor-pointer hover:bg-accent/30 transition-colors"
                  onClick={() => router.push(`/project/${lead.project!.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {lead.name || "No name"}
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
                          <p className="text-muted-foreground text-sm mb-1">Project Overview</p>
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
                            Notes
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
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
