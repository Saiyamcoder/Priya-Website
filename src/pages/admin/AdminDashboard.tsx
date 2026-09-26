import { useProjects, useServices, useTestimonials } from "@/hooks/usePortfolioData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FolderOpen, Image, Briefcase, MessageSquare, Mail } from "lucide-react";

export default function AdminDashboard() {
  const { data: projects } = useProjects();
  const { data: services } = useServices();
  const { data: testimonials } = useTestimonials();
  const { data: media } = useQuery({
    queryKey: ["media"],
    queryFn: async () => {
      const { data } = await supabase.from("media").select("*");
      return data;
    },
  });
  const { data: messages } = useQuery({
    queryKey: ["contact-messages"],
    queryFn: async () => {
      const { data } = await supabase.from("contact_messages").select("*");
      return data;
    },
  });

  const stats = [
    { label: "Projects", count: projects?.length || 0, icon: FolderOpen, color: "text-primary" },
    { label: "Media Files", count: media?.length || 0, icon: Image, color: "text-secondary" },
    { label: "Services", count: services?.length || 0, icon: Briefcase, color: "text-accent" },
    { label: "Testimonials", count: testimonials?.length || 0, icon: MessageSquare, color: "text-success" },
    { label: "Messages", count: messages?.length || 0, icon: Mail, color: "text-warning" },
  ];

  const unread = messages?.filter((m) => !m.read).length || 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-xl p-5">
            <s.icon className={`w-6 h-6 mb-3 ${s.color}`} />
            <div className="text-2xl font-bold">{s.count}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {unread > 0 && (
        <div className="glass rounded-xl p-5 border-l-4 border-warning">
          <p className="font-medium">You have {unread} unread message{unread > 1 ? "s" : ""}</p>
          <a href="/admin/messages" className="text-sm text-primary hover:underline">View messages →</a>
        </div>
      )}
    </div>
  );
}
