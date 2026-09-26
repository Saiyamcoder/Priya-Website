import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useSiteSettings } from "@/hooks/usePortfolioData";
import { Code, Palette, Globe, Zap, Figma, Monitor } from "lucide-react";

const defaultSkills = [
  { name: "React", icon: Code, level: 90 },
  { name: "Design", icon: Palette, level: 85 },
  { name: "TypeScript", icon: Globe, level: 80 },
  { name: "Tailwind CSS", icon: Zap, level: 95 },
  { name: "Figma", icon: Figma, level: 75 },
  { name: "Responsive", icon: Monitor, level: 90 },
];

export default function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: settings } = useSiteSettings();

  const bio = settings?.bio || "I'm a creative developer and designer based in Palanpur, Gujarat, India. With a BCA degree from Hemchandracharya North Gujarat University (HNGU), I bring ideas to life through clean code and stunning design. I'm passionate about creating seamless digital experiences that make a lasting impression.";

  return (
    <section id="about" className="py-24 relative" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="gradient-text">Me</span>
          </h2>
          <div className="w-20 h-1 mx-auto rounded-full" style={{ background: "var(--gradient-primary)" }} />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              {bio}
            </p>
            <div className="glass rounded-xl p-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold gradient-text">3+</div>
                  <div className="text-muted-foreground text-sm">Years Experience</div>
                </div>
                <div>
                  <div className="text-3xl font-bold gradient-text">20+</div>
                  <div className="text-muted-foreground text-sm">Projects Done</div>
                </div>
                <div>
                  <div className="text-3xl font-bold gradient-text">15+</div>
                  <div className="text-muted-foreground text-sm">Happy Clients</div>
                </div>
                <div>
                  <div className="text-3xl font-bold gradient-text">BCA</div>
                  <div className="text-muted-foreground text-sm">Degree (HNGU)</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold mb-6">My Skills</h3>
            {defaultSkills.map((skill, i) => (
              <div key={skill.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <skill.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{skill.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{skill.level}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${skill.level}%` } : {}}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: "var(--gradient-primary)" }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
