import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
  Building,
  Building2,
  User,
  Star,
  ThumbsUp,
  ThumbsDown,
  Wallet,
  Settings,
  Upload
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { getProfileData, updateProfile } from "@/lib/profile.functions";
import { listCompanyInternships, createInternship, deleteInternship } from "@/lib/internships.functions";
import { listCompanyApplications, updateApplicationStatus } from "@/lib/applications.functions";
import { getCompany } from "@/lib/companies.functions";
import { CompanyLogo } from "@/components/company-logo";
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
  const [activeTab, setActiveTab] = useState("applicants");

  
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
  const [contactEmail, setContactEmail] = useState("");
  
  const [postCompany, setPostCompany] = useState("");
  const [postCompanyDomain, setPostCompanyDomain] = useState("");
  const [postCompanyType, setPostCompanyType] = useState("Startup");

  // Queries
  const profileQ = useQuery({ queryKey: ["profile"], queryFn: () => getProfileData() });
  const internshipsQ = useQuery({ queryKey: ["company-internships"], queryFn: () => listCompanyInternships() });
  const applicationsQ = useQuery({ queryKey: ["company-applications"], queryFn: () => listCompanyApplications() });

  const companyName = profileQ.data?.profile?.company_name ?? "Your Company";
  const companyDomain = profileQ.data?.profile?.company_domain ?? "";

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    location: "",
    phone: "",
    linkedin_url: "",
    portfolio_url: "",
    company_name: "",
    company_domain: "",
    company_type: "",
    company_size: "",
    founded_year: "",
    company_bio: "",
    logo_url: "",
  });

  useEffect(() => {
    if (profileQ.data?.profile) {
      const p = profileQ.data.profile;
      setProfileForm({
        full_name: p.full_name ?? "",
        location: p.location ?? "",
        phone: p.phone ?? "",
        linkedin_url: p.linkedin_url ?? "",
        portfolio_url: p.portfolio_url ?? "",
        company_name: p.company_name ?? "",
        company_domain: p.company_domain ?? "",
        company_type: p.company_type ?? "",
        company_size: p.company_size ?? "",
        founded_year: p.founded_year ? String(p.founded_year) : "",
        company_bio: p.company_bio ?? "",
        logo_url: p.logo_url ?? "",
      });
      setPostCompany(p.company_name ?? "");
      setPostCompanyDomain(p.company_domain ?? "");
      setPostCompanyType(p.company_type || "Startup");
    }
  }, [profileQ.data]);

  // Profile Save Mutation
  const saveProfileM = useMutation({
    mutationFn: () =>
      updateProfile({
        data: {
          ...profileForm,
          founded_year: profileForm.founded_year ? parseInt(profileForm.founded_year, 10) : null,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["company", companyName] });
      toast.success("Company profile updated successfully!");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Failed to save profile");
    },
  });

  // Logo upload state
  const [logoUploading, setLogoUploading] = useState(false);

  // Settings states backed by localStorage
  const [emailNotify, setEmailNotify] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("recruiter_email_notify") !== "false";
    }
    return true;
  });
  const [browserNotify, setBrowserNotify] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("recruiter_browser_notify") === "true";
    }
    return false;
  });
  const [profileVisible, setProfileVisible] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("recruiter_profile_visible") !== "false";
    }
    return true;
  });
  const [devMode, setDevMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("recruiter_dev_mode") === "true";
    }
    return false;
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File is too large. Max size is 2MB.");
      return;
    }

    const userId = profileQ.data?.profile?.user_id;
    if (!userId) {
      toast.error("User ID not found. Please reload page.");
      return;
    }

    setLogoUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/${Date.now()}-logo.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("logos")
        .getPublicUrl(filePath);

      setProfileForm(prev => ({ ...prev, logo_url: publicUrl }));
      toast.success("Logo uploaded successfully! Click save profile details to persist changes.");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload logo.");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleClearAllPostings = async () => {
    if (!confirm("Are you sure you want to delete all job postings? This action is irreversible.")) return;
    const postings = internshipsQ.data ?? [];
    if (postings.length === 0) {
      toast.info("No postings to delete.");
      return;
    }
    try {
      for (const post of postings) {
        await deleteMutation.mutateAsync({ id: post.id });
      }
      toast.success("All postings deleted successfully.");
    } catch (err: any) {
      toast.error("Failed to delete some postings.");
    }
  };

  const handleResetProfile = () => {
    if (!confirm("Are you sure you want to reset all profile details? This will clear your form fields locally.")) return;
    setProfileForm({
      full_name: "",
      location: "",
      phone: "",
      linkedin_url: "",
      portfolio_url: "",
      company_name: "",
      company_domain: "",
      company_type: "",
      company_size: "",
      founded_year: "",
      company_bio: "",
      logo_url: "",
    });
    toast.success("Form fields reset locally. Click save to persist.");
  };

  // Public Preview Query
  const companyPublicQ = useQuery({
    queryKey: ["company", companyName],
    queryFn: () => getCompany({ data: { company: companyName } }),
    enabled: !!companyName && companyName !== "Your Company",
  });

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
      setContactEmail("");
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
      company: postCompany || companyName,
      company_domain: postCompanyDomain || companyDomain,
      company_type: postCompanyType,
      contact_email: contactEmail,
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
                  Enter the details for the new internship listing. You can set the company details manually below.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6 space-y-4">
                {/* Manual Company Override Fields */}
                <div className="p-4 rounded-lg border bg-muted/40 grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="postCompany">Company Name</Label>
                    <Input
                      id="postCompany"
                      value={postCompany}
                      onChange={(e) => setPostCompany(e.target.value)}
                      placeholder="e.g. Acme Corporation"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postCompanyDomain">Company Domain</Label>
                    <Input
                      id="postCompanyDomain"
                      value={postCompanyDomain}
                      onChange={(e) => setPostCompanyDomain(e.target.value)}
                      placeholder="e.g. acme.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postCompanyType">Company Type</Label>
                    <Select value={postCompanyType} onValueChange={setPostCompanyType}>
                      <SelectTrigger id="postCompanyType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Startup">Startup</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                        <SelectItem value="Agency">Agency</SelectItem>
                        <SelectItem value="NGO">NGO / Non-profit</SelectItem>
                        <SelectItem value="Educational Institution">Educational Institution</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Company Contact Email (for applications)</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. careers@company.com"
                    required
                  />
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="applicants" className="gap-2">
            <Users className="h-4 w-4" /> Applicants
          </TabsTrigger>
          <TabsTrigger value="postings" className="gap-2">
            <Briefcase className="h-4 w-4" /> Job Listings
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <Building2 className="h-4 w-4" /> Company Profile
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" /> View Public Page
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" /> Settings
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

        <TabsContent value="profile">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6 shadow-sm">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold border-b border-border pb-4">
                <Building2 className="h-5 w-5 text-primary" /> Company Details
              </h2>
              <div className="mt-5 space-y-4">
                {/* Logo Upload Section */}
                <div className="flex items-center gap-4 p-4 rounded-lg border border-dashed border-border bg-muted/40 mb-6">
                  <div className="relative group">
                    <CompanyLogo
                      domain={profileForm.company_domain}
                      name={profileForm.company_name}
                      logoUrl={profileForm.logo_url}
                      size={64}
                      className="transition-transform group-hover:scale-105"
                    />
                    {logoUploading && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                        <span className="h-4 w-4 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-sm font-semibold">Company Logo</Label>
                    <p className="text-[10px] text-muted-foreground">
                      Upload custom square logo. Fallback is Google favicon. Max 2MB.
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload-input"
                        disabled={logoUploading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5 cursor-pointer"
                        asChild
                        disabled={logoUploading}
                      >
                        <label htmlFor="logo-upload-input" className="cursor-pointer">
                          <Upload className="h-3.5 w-3.5" />
                          {logoUploading ? "Uploading..." : "Upload logo"}
                        </label>
                      </Button>
                      {profileForm.logo_url && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setProfileForm(p => ({ ...p, logo_url: "" }))}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="profile-company-name" className="mb-1.5 block">Company Name</Label>
                  <Input
                    id="profile-company-name"
                    value={profileForm.company_name}
                    onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })}
                    placeholder="e.g. Acme Corporation"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="profile-company-domain">Company Website / Domain</Label>
                    <span className="text-[10px] text-muted-foreground">Used for fallback favicon fetching</span>
                  </div>
                  <Input
                    id="profile-company-domain"
                    value={profileForm.company_domain}
                    onChange={(e) => setProfileForm({ ...profileForm, company_domain: e.target.value })}
                    placeholder="e.g. acme.com (no https://)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="profile-company-type" className="mb-1.5 block">Company Type</Label>
                    <Select
                      value={profileForm.company_type}
                      onValueChange={(val) => setProfileForm({ ...profileForm, company_type: val })}
                    >
                      <SelectTrigger id="profile-company-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Startup">Startup</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                        <SelectItem value="Agency">Agency</SelectItem>
                        <SelectItem value="NGO">NGO / Non-profit</SelectItem>
                        <SelectItem value="Educational Institution">Educational Institution</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="profile-company-size" className="mb-1.5 block">Company Size</Label>
                    <Select
                      value={profileForm.company_size}
                      onValueChange={(val) => setProfileForm({ ...profileForm, company_size: val })}
                    >
                      <SelectTrigger id="profile-company-size">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="500+">500+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="profile-location" className="mb-1.5 block">Location</Label>
                    <Input
                      id="profile-location"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      placeholder="e.g. Dhaka, Bangladesh"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-founded-year" className="mb-1.5 block">Founded Year</Label>
                    <Input
                      id="profile-founded-year"
                      type="number"
                      value={profileForm.founded_year}
                      onChange={(e) => setProfileForm({ ...profileForm, founded_year: e.target.value })}
                      placeholder="e.g. 2018"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="profile-portfolio-url" className="mb-1.5 block">Full Website URL</Label>
                  <Input
                    id="profile-portfolio-url"
                    value={profileForm.portfolio_url}
                    onChange={(e) => setProfileForm({ ...profileForm, portfolio_url: e.target.value })}
                    placeholder="e.g. https://www.acme.com"
                  />
                </div>
                <div>
                  <Label htmlFor="profile-company-bio" className="mb-1.5 block">Company Bio / Description</Label>
                  <Textarea
                    id="profile-company-bio"
                    value={profileForm.company_bio}
                    onChange={(e) => setProfileForm({ ...profileForm, company_bio: e.target.value })}
                    placeholder="Write a short summary about your organization, mission, and work environment..."
                    rows={4}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-sm">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold border-b border-border pb-4">
                <User className="h-5 w-5 text-primary" /> Recruiter Details & Socials
              </h2>
              <div className="mt-5 space-y-4">
                <div>
                  <Label htmlFor="profile-full-name" className="mb-1.5 block">Recruiter Name</Label>
                  <Input
                    id="profile-full-name"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    placeholder="e.g. Irfan Shazid"
                  />
                </div>
                <div>
                  <Label htmlFor="profile-phone" className="mb-1.5 block">Contact Phone</Label>
                  <Input
                    id="profile-phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="e.g. +880 1712-345678"
                  />
                </div>
                <div>
                  <Label htmlFor="profile-linkedin-url" className="mb-1.5 block">Company LinkedIn URL</Label>
                  <Input
                    id="profile-linkedin-url"
                    value={profileForm.linkedin_url}
                    onChange={(e) => setProfileForm({ ...profileForm, linkedin_url: e.target.value })}
                    placeholder="e.g. https://linkedin.com/company/acme"
                  />
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-border flex justify-end">
                <Button onClick={() => saveProfileM.mutate()} disabled={saveProfileM.isPending}>
                  {saveProfileM.isPending ? "Saving..." : "Save Profile Details"}
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          {companyName === "Your Company" || !companyName.trim() ? (
            <Card className="p-8 text-center shadow-sm max-w-xl mx-auto mt-6">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto opacity-40 mb-4" />
              <h3 className="font-bold font-display text-lg">Set up your company profile</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                Before you can preview your public profile page, please set your company name in the Company Profile tab.
              </p>
              <Button onClick={() => setActiveTab("profile")} className="mt-5 gap-1.5">
                Go to Company Profile
              </Button>
            </Card>
          ) : companyPublicQ.isLoading ? (
            <div className="space-y-4 py-8 text-center text-sm text-muted-foreground">
              <span className="animate-pulse">Fetching public profile details...</span>
            </div>
          ) : !companyPublicQ.data || companyPublicQ.data.internships.length === 0 ? (
            <Card className="p-8 text-center shadow-sm max-w-xl mx-auto mt-6">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto opacity-40 mb-4" />
              <h3 className="font-bold font-display text-lg">Your profile is not yet public</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                Company profiles are only visible to the public once you have posted at least one active internship listing.
              </p>
              <Button
                onClick={() => {
                  setActiveTab("postings");
                  setIsPostOpen(true);
                }}
                className="mt-5 gap-1.5"
              >
                <Plus className="h-4 w-4" /> Post Your First Internship
              </Button>
            </Card>
          ) : (() => {
            const data = companyPublicQ.data;
            const maxBreakdown = Math.max(1, ...data.ratingBreakdown.map((b) => b.count));
            return (
              <div className="space-y-6">
                {/* Header preview card */}
                <Card className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <CompanyLogo domain={data.companyDomain} name={data.company} logoUrl={data.logoUrl} size={56} />
                      <div>
                        <h1 className="font-display text-2xl font-bold tracking-tight">{data.company}</h1>
                        {data.companyType && (
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Building className="h-4 w-4 text-primary" />
                            {data.companyType}
                          </p>
                        )}
                        {profileForm.location && (
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {profileForm.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-display text-3xl font-bold">
                          {data.avgRating?.toFixed(1) ?? "—"}
                        </span>
                        {data.avgRating !== null && (
                          <span className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={
                                  i <= Math.round(data.avgRating || 0)
                                    ? "h-4 w-4 fill-accent text-accent"
                                    : "h-4 w-4 text-muted-foreground/30"
                                }
                              />
                            ))}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{data.reviewCount} reviews</p>
                    </div>
                  </div>
                </Card>

                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="space-y-6 lg:col-span-2">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-lg font-semibold">Intern reviews</h2>
                    </div>

                    {data.reviews.length === 0 ? (
                      <Card className="p-8 text-center text-sm text-muted-foreground">
                        No student reviews yet. Once students apply and review their internship, they will show up here.
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {data.reviews.map((r) => (
                          <Card key={r.id} className="p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((i) => (
                                    <Star
                                      key={i}
                                      className={
                                        i <= r.rating
                                          ? "h-3.5 w-3.5 fill-accent text-accent"
                                          : "h-3.5 w-3.5 text-muted-foreground/30"
                                      }
                                    />
                                  ))}
                                </span>
                                {r.title && <h3 className="mt-1.5 font-display font-semibold">{r.title}</h3>}
                                <p className="text-xs text-muted-foreground">
                                  {r.role ? `${r.role} · ` : ""}
                                  {r.author_label ?? "Anonymous"}
                                </p>
                              </div>
                            </div>
                            {r.body && <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>}
                            {(r.pros || r.cons) && (
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {r.pros && (
                                  <p className="flex items-start gap-1.5 text-xs">
                                    <ThumbsUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                    {r.pros}
                                  </p>
                                )}
                                {r.cons && (
                                  <p className="flex items-start gap-1.5 text-xs">
                                    <ThumbsDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                                    {r.cons}
                                  </p>
                                )}
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <Card className="p-6">
                      <h2 className="font-display font-semibold border-b border-border pb-2 mb-3">About {data.company}</h2>
                      {data.companyBio ? (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4">{data.companyBio}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic mb-4">No biography provided.</p>
                      )}
                      <div className="space-y-2 text-xs border-t border-border pt-3">
                        {data.companyType && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-semibold text-foreground">{data.companyType}</span>
                          </div>
                        )}
                        {data.companySize && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Size:</span>
                            <span className="font-semibold text-foreground">{data.companySize}</span>
                          </div>
                        )}
                        {data.foundedYear && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Founded:</span>
                            <span className="font-semibold text-foreground">{data.foundedYear}</span>
                          </div>
                        )}
                        {profileForm.portfolio_url && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Website:</span>
                            <a
                              href={profileForm.portfolio_url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-primary hover:underline flex items-center gap-0.5"
                            >
                              Visit site <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h2 className="font-display font-semibold">Rating breakdown</h2>
                      <div className="mt-3 space-y-2">
                        {data.ratingBreakdown.map((b) => (
                          <div key={b.star} className="flex items-center gap-2 text-xs">
                            <span className="w-3 text-muted-foreground">{b.star}</span>
                            <Star className="h-3 w-3 fill-accent text-accent" />
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-accent"
                                style={{ width: `${(b.count / maxBreakdown) * 100}%` }}
                              />
                            </div>
                            <span className="w-5 text-right text-muted-foreground">{b.count}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h2 className="font-display font-semibold">Open roles ({data.internships.length})</h2>
                      <div className="mt-3 space-y-2">
                        {data.internships.map((j) => (
                          <div
                            key={j.id}
                            className="block rounded-lg border border-border p-3"
                          >
                            <p className="text-sm font-medium">{j.title}</p>
                            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {j.location}
                              </span>
                              {j.salary && (
                                <span className="flex items-center gap-1">
                                  <Wallet className="h-3 w-3" /> {j.salary}
                                </span>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            );
          })()}
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="flex items-center gap-2 font-display text-xl font-bold border-b border-border pb-4 mb-4">
                  <Mail className="h-5 w-5 text-primary" /> Notifications Configuration
                </h2>
                <p className="text-xs text-muted-foreground mb-6">
                  Choose how you want to be alerted about new student applications and workspace activities.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold">Email Alerts</Label>
                      <p className="text-xs text-muted-foreground">Receive daily digests of new applications.</p>
                    </div>
                    <Switch
                      checked={emailNotify}
                      onCheckedChange={(val) => {
                        setEmailNotify(val);
                        localStorage.setItem("recruiter_email_notify", String(val));
                        toast.success(`Email alerts ${val ? "enabled" : "disabled"}`);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold">Push Notifications</Label>
                      <p className="text-xs text-muted-foreground">Get instant notifications in the browser.</p>
                    </div>
                    <Switch
                      checked={browserNotify}
                      onCheckedChange={(val) => {
                        setBrowserNotify(val);
                        localStorage.setItem("recruiter_browser_notify", String(val));
                        toast.success(`Push notifications ${val ? "enabled" : "disabled"}`);
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="flex items-center gap-2 font-display text-xl font-bold border-b border-border pb-4 mb-4">
                  <Settings className="h-5 w-5 text-primary" /> Workspace Settings
                </h2>
                <p className="text-xs text-muted-foreground mb-6">
                  Manage the visibility of your recruiter workspace and configure workspace developer tools.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold">Profile Visibility</Label>
                      <p className="text-xs text-muted-foreground">Make your company public to students.</p>
                    </div>
                    <Switch
                      checked={profileVisible}
                      onCheckedChange={(val) => {
                        setProfileVisible(val);
                        localStorage.setItem("recruiter_profile_visible", String(val));
                        toast.success(`Profile visibility set to ${val ? "public" : "hidden"}`);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold">Developer Mode</Label>
                      <p className="text-xs text-muted-foreground">Enable verbose logs and diagnostic features.</p>
                    </div>
                    <Switch
                      checked={devMode}
                      onCheckedChange={(val) => {
                        setDevMode(val);
                        localStorage.setItem("recruiter_dev_mode", String(val));
                        toast.success(`Developer Mode ${val ? "enabled" : "disabled"}`);
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-sm md:col-span-2 border-destructive/20 bg-destructive/5">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-destructive border-b border-destructive/10 pb-4 mb-4">
                Danger Zone
              </h2>
              <p className="text-xs text-muted-foreground mb-6">
                Irreversible actions that modify or clear your workspace postings and profile data. Use with caution.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg border border-destructive/10 bg-background flex flex-col justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-foreground">Delete All Postings</h3>
                    <p className="text-xs text-muted-foreground">
                      Remove all active internship listings posted by this account.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-fit"
                    onClick={handleClearAllPostings}
                  >
                    Clear All Postings
                  </Button>
                </div>
                <div className="p-4 rounded-lg border border-destructive/10 bg-background flex flex-col justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-foreground">Reset Profile Form</h3>
                    <p className="text-xs text-muted-foreground">
                      Clear all input values on your profile form and logo fields locally.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit border-destructive text-destructive hover:bg-destructive/10"
                    onClick={handleResetProfile}
                  >
                    Reset Profile Details
                  </Button>
                </div>
              </div>
            </Card>
          </div>
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

              //links
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

              
              {(selectedApplicant.cv_url || selectedApplicant.ssc_certificate_url || selectedApplicant.hsc_certificate_url) && (
                <div className="border-t border-border pt-4 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <FileText className="h-4.5 w-4.5 text-primary" /> Submitted Application Documents
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedApplicant.cv_url && (
                      <Button variant="outline" size="sm" className="gap-1.5" asChild>
                        <a href={selectedApplicant.cv_url} target="_blank" rel="noreferrer">
                          <FileText className="h-4 w-4 text-primary" /> CV / Resume <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {selectedApplicant.ssc_certificate_url && (
                      <Button variant="outline" size="sm" className="gap-1.5" asChild>
                        <a href={selectedApplicant.ssc_certificate_url} target="_blank" rel="noreferrer">
                          <Award className="h-4 w-4 text-amber-500" /> SSC Certificate <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {selectedApplicant.hsc_certificate_url && (
                      <Button variant="outline" size="sm" className="gap-1.5" asChild>
                        <a href={selectedApplicant.hsc_certificate_url} target="_blank" rel="noreferrer">
                          <Award className="h-4 w-4 text-emerald-500" /> HSC Certificate <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}

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
