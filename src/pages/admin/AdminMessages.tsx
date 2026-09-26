import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

export default function AdminMessages() {
  const qc = useQueryClient();
  const { data: messages, isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("contact_messages").update({ read: true }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-messages"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("contact_messages").delete().eq("id", id);
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-messages"] }); },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Contact Messages</h2>
      <div className="space-y-4">
        {messages?.map((m) => (
          <div key={m.id} className={`glass rounded-xl p-5 ${!m.read ? "border-l-4 border-primary" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium">{m.name}</span>
                  <span className="text-sm text-muted-foreground">{m.email}</span>
                  {!m.read && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">New</span>}
                </div>
                <p className="text-muted-foreground text-sm">{m.message}</p>
                <div className="text-xs text-muted-foreground mt-2">{new Date(m.created_at).toLocaleString()}</div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!m.read && (
                  <button onClick={() => markReadMutation.mutate(m.id)} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all" title="Mark as read">
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(m.id); }} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {(!messages || messages.length === 0) && <p className="text-center text-muted-foreground py-8">No messages yet.</p>}
      </div>
    </div>
  );
}
