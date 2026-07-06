import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GraduationCap, Building2, ArrowRight, Sparkles, Building, Globe } from "lucide-react";
import { updateUserRole } from "@/lib/profile.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/select-role")({
  head: () => ({ meta: [{ title: "Choose Your Path — Skilltern" }] }),
  component: SelectRolePage,
});

function SelectRolePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [role, setRole] = useState<"student" | "company" | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [companyDomain, setCompanyDomain] = useState("");

  const updateRoleMutation = useMutation({
    mutationFn: (v: any) => updateUserRole({ data: v }),
    onSuccess: (updatedProfile) => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Welcome aboard!");
      if (updatedProfile.role === "company") {
        navigate({ to: "/company" });
      } else {
        navigate({ to: "/onboarding" });
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update role. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    if (role === "company" && (!companyName.trim() || !companyDomain.trim())) {
      toast.error("Please fill in all company details.");
      return;
    }

    updateRoleMutation.mutate({
      role,
      company_name: role === "company" ? companyName.trim() : null,
      company_domain: role === "company" ? companyDomain.trim() : null,
    });
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center py-10 px-4">
      <div className="mx-auto w-full max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3 w-3" /> Let's get started
        </div>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Choose your <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Skilltern</span> path
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Are you looking to kickstart your career with internships, or are you a company seeking top-tier talent in Bangladesh?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-12 w-full max-w-2xl space-y-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Student Card */}
          <Card
            onClick={() => setRole("student")}
            className={`relative cursor-pointer overflow-hidden border-2 p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 ${
              role === "student"
                ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                : "border-border bg-card"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-xl font-bold font-display">I'm a Student</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse matches, analyze your resume against job postings, track applications, and grow with your AI Mentor.
            </p>
            {role === "student" && (
              <div className="absolute right-4 top-4 h-3 w-3 rounded-full bg-primary animate-pulse" />
            )}
          </Card>

          {/* Company Card */}
          <Card
            onClick={() => setRole("company")}
            className={`relative cursor-pointer overflow-hidden border-2 p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 ${
              role === "company"
                ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                : "border-border bg-card"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-xl font-bold font-display">I'm a Recruiter / Company</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Post new internship openings, track candidate lists, filter by match scores, and hire the best interns.
            </p>
            {role === "company" && (
              <div className="absolute right-4 top-4 h-3 w-3 rounded-full bg-primary animate-pulse" />
            )}
          </Card>
        </div>

        {/* Recruiter Details Form */}
        {role === "company" && (
          <Card className="border border-border p-6 shadow-sm transition-all duration-300 animate-in fade-in-50 slide-in-from-top-4">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" /> Tell us about your company
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              We'll use this information to customize your postings and profile.
            </p>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Brain Station 23"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyDomain">Company Website Domain</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyDomain"
                    value={companyDomain}
                    onChange={(e) => setCompanyDomain(e.target.value)}
                    placeholder="e.g. brainstation-23.com"
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used to dynamically retrieve your company logo.
                </p>
              </div>
            </div>
          </Card>
        )}

        {role && (
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updateRoleMutation.isPending}
              size="lg"
              className="gap-2 px-8"
            >
              {updateRoleMutation.isPending ? (
                "Saving..."
              ) : (
                <>
                  Continue <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
