import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useServices } from "@/hooks/usePortfolioData";
import { Code, Palette, Globe, Smartphone, Camera, PenTool } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code, palette: Palette, globe: Globe, smartphone: Smartphone, camera: Camera, pen: PenTool,
};

export default function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: services } = useServices();

  if (!services || services.length === 0) return null;

  return (
    <section id="services" className="py-24 relative" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            My <span className="gradient-text">Services</span>
          </h2>
          <div className="w-20 h-1 mx-auto rounded-full" style={{ background: "var(--gradient-primary)" }} />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const IconComp = iconMap[service.icon?.toLowerCase() || "code"] || Code;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                whileHover={{ y: -10 }}
                className="glass rounded-xl p-8 text-center group cursor-pointer transition-shadow duration-300 hover:glow-blue"
              >
                <div className="w-14 h-14 rounded-xl mx-auto mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: "var(--gradient-primary)" }}>
                  <IconComp className="w-7 h-7 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
