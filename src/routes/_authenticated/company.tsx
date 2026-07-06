import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  Eye,
  FileText,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Linkedin,
  Github,
  Award,
  Globe,
  Building
} from "lucide-react";
import { getProfileData } from "@/lib/profile.functions";
import { listCompanyInternships, createInternship, deleteInternship } from "@/lib/internships.functions";
import { listCompanyApplications, updateApplicationStatus } from "@/lib/applications.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/company")({
  head: () => ({ meta: [{ title: "Recruiter Dashboard — Skilltern" }] }),
  component: CompanyDashboardPage,
});

function CompanyDashboardPage() {
  const qc = useQueryClient();
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [duration, setDuration] = useState("");
  const [workModel, setWorkModel] = useState("on-site");
  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [techStack, setTechStack] = useState("");
  const [preferredSkills, setPreferredSkills] = useState("");

  // Queries
  const profileQ = useQuery({ queryKey: ["profile"], queryFn: () => getProfileData() });
  const internshipsQ = useQuery({ queryKey: ["company-internships"], queryFn: () => listCompanyInternships() });
  const applicationsQ = useQuery({ queryKey: ["company-applications"], queryFn: () => listCompanyApplications() });

  const companyName = profileQ.data?.profile?.company_name ?? "Your Company";
  const companyDomain = profileQ.data?.profile?.company_domain ?? "";

  // Mutations
  const createMutation = useMutation({
    mutationFn: (v: any) => createInternship({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company-internships"] });
      toast.success("Internship listing created successfully!");
      setIsPostOpen(false);
      // Reset form
      setTitle("");
      setDomain("");
      setLocation("");
      setSalary("");
      setDuration("");
      setDescription("");
      setRequirements("");
      setResponsibilities("");
      setTechStack("");
      setPreferredSkills("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create listing.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (v: { id: string }) => deleteInternship({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company-internships"] });
      toast.success("Listing deleted.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete listing.");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (v: { id: string; status: string }) => updateApplicationStatus({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company-applications"] });
      toast.success("Application status updated.");
      if (selectedApplicant) {
        // Update local detail state if open
        const updated = applicationsQ.data?.applications.find((a: any) => a.id === selectedApplicant.id);
        if (updated) setSelectedApplicant(updated);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status.");
    },
  });

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title,
      domain,
      location,
      company: companyName,
      company_domain: companyDomain,
      company_type: "Startup",
      salary,
      duration,
      work_model: workModel,
      experience_level: experienceLevel,
      description,
      requirements: requirements.split("\n").map(r => r.trim()).filter(Boolean),
      responsibilities: responsibilities.split("\n").map(r => r.trim()).filter(Boolean),
      tech_stack: techStack.split(",").map(t => t.trim()).filter(Boolean),
      preferred_skills: preferredSkills.split(",").map(p => p.trim()).filter(Boolean),
    });
  };

  const activePostingsCount = internshipsQ.data?.length ?? 0;
  const totalApplicantsCount = applicationsQ.data?.applications?.length ?? 0;
  const pendingReviewCount = applicationsQ.data?.applications?.filter((a: any) => a.status === "applied" || a.status === "saved").length ?? 0;
  const offeredCount = applicationsQ.data?.applications?.filter((a: any) => a.status === "offered" || a.status === "accepted").length ?? 0;

  return (
    <div className="space-y-8">
      {/* Upper Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Recruiter Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
            <Building className="h-4 w-4 text-primary" /> {companyName} {companyDomain && `(${companyDomain})`}
          </p>
        </div>
        <Dialog open={isPostOpen} onOpenChange={setIsPostOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Post Internship
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handlePostSubmit}>
              <DialogHeader>
                <DialogTitle>Post a New Internship</DialogTitle>
                <DialogDescription>
                  Enter the details for the new internship listing. We will auto-fill your company details.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Internship Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. SQA Intern" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain / Category</Label>
                    <Input id="domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="e.g. Software Engineering" required />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Dhaka, Bangladesh" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Monthly Stipend</Label>
                    <Input id="salary" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g. 15,000 BDT" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 3-6 months" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="workModel">Work Model</Label>
                    <Select value={workModel} onValueChange={setWorkModel}>
                      <SelectTrigger id="workModel">
                        <SelectValue placeholder="Select work model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on-site">On-site</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expLevel">Experience Level Required</Label>
                    <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                      <SelectTrigger id="expLevel">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (No experience required)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (Basic skills required)</SelectItem>
                        <SelectItem value="advanced">Advanced (Proficient skills required)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc">Job Description</Label>
                  <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Write a short summary of the role..." rows={3} required />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reqs">Requirements (One per line)</Label>
                    <Textarea id="reqs" value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="Strong JavaScript background&#10;Familiarity with PostgreSQL" rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resps">Responsibilities (One per line)</Label>
                    <Textarea id="resps" value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} placeholder="Develop frontend pages&#10;Write clean, tested components" rows={3} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tech">Required Tech Stack (Comma separated)</Label>
                    <Input id="tech" value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="React, TypeScript, Tailwind" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pref">Preferred Skills (Comma separated)</Label>
                    <Input id="pref" value={preferredSkills} onChange={(e) => setPreferredSkills(e.target.value)} placeholder="Node.js, Supabase, Git" />
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsPostOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Listing"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Active Postings</p>
            <h3 className="text-3xl font-bold font-display mt-1">{activePostingsCount}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Briefcase className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Applicants</p>
            <h3 className="text-3xl font-bold font-display mt-1">{totalApplicantsCount}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Pending Review</p>
            <h3 className="text-3xl font-bold font-display mt-1">{pendingReviewCount}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Offered / Accepted</p>
            <h3 className="text-3xl font-bold font-display mt-1">{offeredCount}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="applicants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applicants" className="gap-2">
            <Users className="h-4 w-4" /> Applicants
          </TabsTrigger>
          <TabsTrigger value="postings" className="gap-2">
            <Briefcase className="h-4 w-4" /> Job Listings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applicants">
          <Card className="p-6 shadow-sm">
            <h2 className="text-xl font-bold font-display border-b border-border pb-4">Manage Applicants</h2>
            {applicationsQ.isLoading ? (
              <p className="text-sm text-muted-foreground py-10 text-center">Loading applicant list...</p>
            ) : !applicationsQ.data?.applications || applicationsQ.data.applications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto opacity-40 mb-4" />
                <p className="text-sm text-muted-foreground">No students have applied to your postings yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Role Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applicationsQ.data.applications.map((app: any) => {
                      const applicantName = app.profile?.full_name ?? "Student applicant";
                      const applicantEmail = app.profile?.email ?? "No email";
                      return (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div>
                              <p className="font-semibold text-sm">{applicantName}</p>
                              <p className="text-xs text-muted-foreground">{applicantEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{app.internship?.title}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                app.status === "accepted" || app.status === "offered"
                                  ? "default"
                                  : app.status === "rejected" || app.status === "declined"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="capitalize"
                            >
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(app.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => setSelectedApplicant(app)}
                            >
                              <Eye className="h-4 w-4" /> Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="postings">
          <Card className="p-6 shadow-sm">
            <h2 className="text-xl font-bold font-display border-b border-border pb-4">Active Listings</h2>
            {internshipsQ.isLoading ? (
              <p className="text-sm text-muted-foreground py-10 text-center">Loading listings...</p>
            ) : !internshipsQ.data || internshipsQ.data.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto opacity-40 mb-4" />
                <p className="text-sm text-muted-foreground">You haven't posted any internships yet.</p>
                <Button onClick={() => setIsPostOpen(true)} className="mt-4 gap-1.5">
                  <Plus className="h-4 w-4" /> Create first listing
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 mt-6">
                {internshipsQ.data.map((job: any) => {
                  const jobApplicants = applicationsQ.data?.applications?.filter((a: any) => a.internship_id === job.id) ?? [];
                  return (
                    <Card key={job.id} className="p-5 border border-border flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold text-lg font-display">{job.title}</h3>
                          <Badge variant="outline" className="capitalize">{job.work_model}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {job.location}
                        </p>
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{job.description}</p>
                        <div className="flex gap-2 flex-wrap mt-3">
                          {Array.isArray(job.tech_stack) && job.tech_stack.slice(0, 3).map((t: string) => (
                            <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-border pt-3">
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {jobApplicants.length} applicants
                        </span>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this internship posting?")) {
                              deleteMutation.mutate({ id: job.id });
                            }
                          }}
                          aria-label="Delete listing"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Applicant Detail Dialog */}
      <Dialog open={!!selectedApplicant} onOpenChange={(open) => !open && setSelectedApplicant(null)}>
        {selectedApplicant && (
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Applicant Review</DialogTitle>
              <DialogDescription>
                Review candidate credentials and change recruitment status.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-5">
              {/* Profile Card */}
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 text-primary font-bold font-display text-xl flex items-center justify-center">
                  {selectedApplicant.profile?.full_name?.[0]?.toUpperCase() ?? "S"}
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display">
                    {selectedApplicant.profile?.full_name ?? "Student applicant"}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5" /> {selectedApplicant.profile?.location ?? "Bangladesh"}
                  </p>
                </div>
              </div>

              {/* Contact info */}
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="truncate">{selectedApplicant.profile?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{selectedApplicant.profile?.phone ?? "No phone"}</span>
                </div>
              </div>

              {/* Professional links */}
              <div className="flex gap-3 border-t border-border pt-4">
                {selectedApplicant.profile?.linkedin_url && (
                  <Button variant="outline" size="sm" className="gap-1.5" asChild>
                    <a href={selectedApplicant.profile.linkedin_url} target="_blank" rel="noreferrer">
                      <Linkedin className="h-4 w-4" /> LinkedIn <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
                {selectedApplicant.profile?.github_url && (
                  <Button variant="outline" size="sm" className="gap-1.5" asChild>
                    <a href={selectedApplicant.profile.github_url} target="_blank" rel="noreferrer">
                      <Github className="h-4 w-4" /> GitHub <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
                {selectedApplicant.profile?.portfolio_url && (
                  <Button variant="outline" size="sm" className="gap-1.5" asChild>
                    <a href={selectedApplicant.profile.portfolio_url} target="_blank" rel="noreferrer">
                      <Globe className="h-4 w-4" /> Portfolio <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>

              {/* Status Update section */}
              <div className="border-t border-border pt-4 space-y-3">
                <Label htmlFor="applicantStatus">Recruitment Stage</Label>
                <div className="flex gap-3 items-center">
                  <div className="w-48">
                    <Select
                      value={selectedApplicant.status}
                      onValueChange={(val) =>
                        updateStatusMutation.mutate({ id: selectedApplicant.id, status: val })
                      }
                    >
                      <SelectTrigger id="applicantStatus">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applied">Applied (Reviewing)</SelectItem>
                        <SelectItem value="interviewing">Interviewing</SelectItem>
                        <SelectItem value="offered">Offered</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {updateStatusMutation.isPending && (
                    <span className="text-xs text-muted-foreground animate-pulse">Updating...</span>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6 border-t border-border pt-3">
              <Button onClick={() => setSelectedApplicant(null)}>Close Review</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
