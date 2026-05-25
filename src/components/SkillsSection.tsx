"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Code2, Server, Palette } from "lucide-react";

interface Skill {
  name: string;
  level: number;
}

interface SkillCategory {
  title: string;
  icon: React.ReactNode;
  skills: Skill[];
  tags: string[];
}

const skillCategories: SkillCategory[] = [
  {
    title: "Frontend",
    icon: <Code2 className="size-5" />,
    skills: [
      { name: "React / Next.js", level: 95 },
      { name: "TypeScript", level: 90 },
      { name: "Tailwind CSS", level: 92 },
      { name: "Framer Motion", level: 85 },
    ],
    tags: ["React", "Next.js", "TypeScript", "Vue", "Tailwind", "Framer Motion"],
  },
  {
    title: "Backend",
    icon: <Server className="size-5" />,
    skills: [
      { name: "Node.js", level: 88 },
      { name: "PostgreSQL", level: 82 },
      { name: "REST / GraphQL", level: 86 },
      { name: "Docker / CI/CD", level: 78 },
    ],
    tags: ["Node.js", "Python", "PostgreSQL", "GraphQL", "Docker", "AWS"],
  },
  {
    title: "Design",
    icon: <Palette className="size-5" />,
    skills: [
      { name: "UI/UX Design", level: 90 },
      { name: "Figma", level: 92 },
      { name: "Design Systems", level: 87 },
      { name: "Prototyping", level: 84 },
    ],
    tags: ["Figma", "UI/UX", "Design Systems", "Prototyping", "Typography", "Illustration"],
  },
];

export default function SkillsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="py-20 sm:py-28 bg-muted/30" ref={ref}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Skills & Expertise
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">
            What I Bring to the Table
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A versatile skill set spanning frontend development, backend
            engineering, and UI/UX design — allowing me to deliver complete
            digital solutions.
          </p>
        </motion.div>

        {/* Skill Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {skillCategories.map((category, catIdx) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + catIdx * 0.15 }}
            >
              <Card className="h-full border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 group">
                <CardContent className="pt-6">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                      {category.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {category.title}
                    </h3>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-4 mb-6">
                    {category.skills.map((skill, skillIdx) => (
                      <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{
                          duration: 0.4,
                          delay: 0.4 + catIdx * 0.15 + skillIdx * 0.08,
                        }}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-medium text-foreground">
                            {skill.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {skill.level}%
                          </span>
                        </div>
                        <Progress
                          value={isInView ? skill.level : 0}
                          className="h-2 transition-all duration-1000"
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {category.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs hover:bg-accent/20 hover:text-accent transition-colors cursor-default"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
