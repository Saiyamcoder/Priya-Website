import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Loader2, X, Save } from "lucide-react";
import { toast } from "sonner";

type Testimonial = { id?: string; client_name: string; client_title: string; content: string; avatar_url: string; rating: number; sort_order: number };
const empty: Testimonial = { client_name: "", client_title: "", content: "", avatar_url: "", rating: 5, sort_order: 0 };

export default function AdminTestimonials() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => { const { data } = await supabase.from("testimonials").select("*").order("sort_order"); return data || []; },
  });
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [isNew, setIsNew] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (t: Testimonial) => {
      const payload = { client_name: t.client_name, client_title: t.client_title, content: t.content, avatar_url: t.avatar_url, rating: t.rating, sort_order: t.sort_order };
      if (t.id) {
        const { error } = await supabase.from("testimonials").update(payload).eq("id", t.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("testimonials").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Saved!"); qc.invalidateQueries({ queryKey: ["admin-testimonials"] }); qc.invalidateQueries({ queryKey: ["testimonials"] }); setEditing(null); setIsNew(false); },
    onError: () => toast.error("Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("testimonials").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-testimonials"] }); qc.invalidateQueries({ queryKey: ["testimonials"] }); },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Testimonials</h2>
        <button onClick={() => { setEditing({ ...empty }); setIsNew(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all hover:scale-[1.02]" style={{ background: "var(--gradient-primary)", color: "hsl(var(--primary-foreground))" }}>
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4" onClick={() => { setEditing(null); setIsNew(false); }}>
          <div className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">{isNew ? "Add" : "Edit"} Testimonial</h3>
              <button onClick={() => { setEditing(null); setIsNew(false); }}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-muted-foreground mb-1 block">Client Name</label><input value={editing.client_name} onChange={(e) => setEditing({ ...editing, client_name: e.target.value })} className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" /></div>
              <div><label className="text-sm font-medium text-muted-foreground mb-1 block">Client Title</label><input value={editing.client_title} onChange={(e) => setEditing({ ...editing, client_title: e.target.value })} className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" /></div>
              <div><label className="text-sm font-medium text-muted-foreground mb-1 block">Review Content</label><textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={3} className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" /></div>
              <div><label className="text-sm font-medium text-muted-foreground mb-1 block">Avatar URL</label><input value={editing.avatar_url} onChange={(e) => setEditing({ ...editing, avatar_url: e.target.value })} className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" /></div>
              <div><label className="text-sm font-medium text-muted-foreground mb-1 block">Rating (1-5)</label><input type="number" min={1} max={5} value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: parseInt(e.target.value) || 5 })} className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" /></div>
              <button onClick={() => saveMutation.mutate(editing)} disabled={saveMutation.isPending || !editing.client_name || !editing.content} className="w-full py-3 rounded-lg font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: "var(--gradient-primary)", color: "hsl(var(--primary-foreground))" }}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {data?.map((t) => (
          <div key={t.id} className="glass rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1"><div className="font-medium">{t.client_name}</div><div className="text-sm text-muted-foreground truncate">"{t.content}"</div></div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing({ ...t } as any); setIsNew(false); }} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(t.id); }} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {(!data || data.length === 0) && <p className="text-center text-muted-foreground py-8">No testimonials yet.</p>}
      </div>
    </div>
  );
}
