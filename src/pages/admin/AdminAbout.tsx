import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const settingsKeys = [
  { key: "name", label: "Full Name", placeholder: "Saiyam Gelot" },
  { key: "bio", label: "Bio", placeholder: "A short bio about yourself...", multiline: true },
  { key: "skills", label: "Skills (comma separated)", placeholder: "React, TypeScript, Figma..." },
  { key: "email", label: "Email", placeholder: "your@email.com" },
  { key: "phone", label: "Phone", placeholder: "+91 XXXXX XXXXX" },
  { key: "github", label: "GitHub URL", placeholder: "https://github.com/..." },
  { key: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/..." },
  { key: "twitter", label: "Twitter URL", placeholder: "https://twitter.com/..." },
];

export default function AdminAbout() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["site-settings-admin"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*");
      const map: Record<string, string> = {};
      data?.forEach((s) => { map[s.key] = s.value || ""; });
      return map;
    },
  });

  const [values, setValues] = useState<Record<string, string>>({});

  const merged = { ...data, ...values };

  const mutation = useMutation({
    mutationFn: async () => {
      for (const [key, value] of Object.entries(values)) {
        const { data: existing } = await supabase.from("site_settings").select("id").eq("key", key).maybeSingle();
        if (existing) {
          await supabase.from("site_settings").update({ value }).eq("key", key);
        } else {
          await supabase.from("site_settings").insert({ key, value });
        }
      }
    },
    onSuccess: () => {
      toast.success("Settings saved!");
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings-admin"] });
      setValues({});
    },
    onError: () => toast.error("Failed to save"),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">About / Settings</h2>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || Object.keys(values).length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
          style={{ background: "var(--gradient-primary)", color: "hsl(var(--primary-foreground))" }}
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="glass rounded-xl p-6 space-y-5 max-w-2xl">
        {settingsKeys.map((s) => (
          <div key={s.key}>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">{s.label}</label>
            {s.multiline ? (
              <textarea
                value={merged[s.key] || ""}
                onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}
                rows={4}
                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                placeholder={s.placeholder}
              />
            ) : (
              <input
                value={merged[s.key] || ""}
                onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}
                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder={s.placeholder}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
