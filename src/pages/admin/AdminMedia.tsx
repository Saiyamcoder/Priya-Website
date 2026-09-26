import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Copy, Loader2, Image } from "lucide-react";
import { toast } from "sonner";

export default function AdminMedia() {
  const qc = useQueryClient();
  const { data: media, isLoading } = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () => {
      const { data } = await supabase.from("media").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("media").insert({ name: name.trim(), url: url.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Image added!");
      qc.invalidateQueries({ queryKey: ["admin-media"] });
      setName("");
      setUrl("");
    },
    onError: () => toast.error("Failed to add"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("media").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-media"] });
    },
  });

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied!");
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Media Library</h2>

      {/* Add form */}
      <div className="glass rounded-xl p-6 mb-8 max-w-xl">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Image className="w-4 h-4 text-primary" /> Add Image via URL</h3>
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            placeholder="Image name"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            placeholder="https://example.com/image.jpg"
          />
          {url && <img src={url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />}
          <button
            onClick={() => addMutation.mutate()}
            disabled={!name.trim() || !url.trim() || addMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ background: "var(--gradient-primary)", color: "hsl(var(--primary-foreground))" }}
          >
            <Plus className="w-4 h-4" /> Add Image
          </button>
        </div>
      </div>

      {/* Media grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media?.map((m) => (
          <div key={m.id} className="glass rounded-xl overflow-hidden group">
            <div className="aspect-square">
              <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <div className="text-sm font-medium truncate">{m.name}</div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => copyUrl(m.url)} className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all" title="Copy URL">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(m.id); }} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {(!media || media.length === 0) && <p className="text-center text-muted-foreground py-8">No media yet.</p>}
    </div>
  );
}
