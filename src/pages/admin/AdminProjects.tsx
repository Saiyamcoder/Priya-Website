import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Loader2, X, Save } from "lucide-react";
import { toast } from "sonner";

type Project = {
  id?: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  link: string;
  sort_order: number;
};

const empty: Project = { title: "", description: "", category: "", image_url: "", link: "", sort_order: 0 };

export default function AdminProjects() {
  const qc = useQueryClient();
  const { data: projects, isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").order("sort_order");
      return data || [];
    },
  });

  const [editing, setEditing] = useState<Project | null>(null);
  const [isNew, setIsNew] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (p: Project) => {
      if (p.id) {
        const { error } = await supabase.from("projects").update({
          title: p.title, description: p.description, category: p.category,
          image_url: p.image_url, link: p.link, sort_order: p.sort_order,
        }).eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("projects").insert({
          title: p.title, description: p.description, category: p.category,
          image_url: p.image_url, link: p.link, sort_order: p.sort_order,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Project saved!");
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      setEditing(null);
      setIsNew(false);
    },
    onError: () => toast.error("Failed to save"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Project deleted");
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Projects</h2>
        <button
          onClick={() => { setEditing({ ...empty }); setIsNew(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all hover:scale-[1.02]"
          style={{ background: "var(--gradient-primary)", color: "hsl(var(--primary-foreground))" }}
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4" onClick={() => { setEditing(null); setIsNew(false); }}>
          <div className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">{isNew ? "Add" : "Edit"} Project</h3>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {[
                { key: "title", label: "Title" },
                { key: "description", label: "Description", multi: true },
                { key: "category", label: "Category" },
                { key: "image_url", label: "Image URL" },
                { key: "link", label: "Project Link" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">{f.label}</label>
                  {f.multi ? (
                    <textarea
                      value={(editing as any)[f.key] || ""}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                      rows={3}
                      className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                    />
                  ) : (
                    <input
                      value={(editing as any)[f.key] || ""}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                      className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  )}
                </div>
              ))}
              {editing.image_url && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Preview</label>
                  <img src={editing.image_url} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                </div>
              )}
              <button
                onClick={() => saveMutation.mutate(editing)}
                disabled={saveMutation.isPending || !editing.title}
                className="w-full py-3 rounded-lg font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: "var(--gradient-primary)", color: "hsl(var(--primary-foreground))" }}
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project list */}
      <div className="grid gap-4">
        {projects?.map((p) => (
          <div key={p.id} className="glass rounded-xl p-4 flex items-center gap-4">
            {p.image_url && <img src={p.image_url} alt={p.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-muted-foreground truncate">{p.description}</div>
              {p.category && <span className="text-xs text-primary">{p.category}</span>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => { setEditing({ ...p } as any); setIsNew(false); }} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(p.id); }} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {(!projects || projects.length === 0) && (
          <p className="text-center text-muted-foreground py-8">No projects yet. Add your first project!</p>
        )}
      </div>
    </div>
  );
}
