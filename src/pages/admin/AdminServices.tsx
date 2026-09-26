import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Loader2, X, Save } from "lucide-react";
import { toast } from "sonner";

type Service = { id?: string; title: string; description: string; icon: string; sort_order: number };
const empty: Service = { title: "", description: "", icon: "code", sort_order: 0 };

export default function AdminServices() {
  const qc = useQueryClient();
  const { data: services, isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => { const { data } = await supabase.from("services").select("*").order("sort_order"); return data || []; },
  });
  const [editing, setEditing] = useState<Service | null>(null);
  const [isNew, setIsNew] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (s: Service) => {
      if (s.id) {
        const { error } = await supabase.from("services").update({ title: s.title, description: s.description, icon: s.icon, sort_order: s.sort_order }).eq("id", s.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").insert({ title: s.title, description: s.description, icon: s.icon, sort_order: s.sort_order });
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Saved!"); qc.invalidateQueries({ queryKey: ["admin-services"] }); qc.invalidateQueries({ queryKey: ["services"] }); setEditing(null); setIsNew(false); },
    onError: () => toast.error("Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("services").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-services"] }); qc.invalidateQueries({ queryKey: ["services"] }); },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Services</h2>
        <button onClick={() => { setEditing({ ...empty }); setIsNew(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all hover:scale-[1.02]" style={{ background: "var(--gradient-primary)", color: "hsl(var(--primary-foreground))" }}>
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4" onClick={() => { setEditing(null); setIsNew(false); }}>
          <div className="glass rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">{isNew ? "Add" : "Edit"} Service</h3>
              <button onClick={() => { setEditing(null); setIsNew(false); }}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Title</label>
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Description</label>
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Icon (code, palette, globe, smartphone, camera, pen)</label>
                <input value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
              <button onClick={() => saveMutation.mutate(editing)} disabled={saveMutation.isPending || !editing.title} className="w-full py-3 rounded-lg font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: "var(--gradient-primary)", color: "hsl(var(--primary-foreground))" }}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {services?.map((s) => (
          <div key={s.id} className="glass rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1"><div className="font-medium">{s.title}</div><div className="text-sm text-muted-foreground truncate">{s.description}</div></div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing({ ...s } as any); setIsNew(false); }} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(s.id); }} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {(!services || services.length === 0) && <p className="text-center text-muted-foreground py-8">No services yet.</p>}
      </div>
    </div>
  );
}
