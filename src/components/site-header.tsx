"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";

export function SiteHeader() {
  const [aura, setAura] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [animateAura, setAnimateAura] = useState(false);

  useEffect(() => {
    async function fetchAura() {
      try {
        const response = await fetch("http://127.0.0.1:5000/get_coins");
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        // The API just returns a number directly
        const data = await response.json();
        console.log("Aura value:", data.brain_coins);
        setAura(data.brain_coins);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch aura:", error);
        setIsLoading(false);
      }
    }

    fetchAura();

    // Set up polling to update aura every 5 seconds
    const intervalId = setInterval(() => {
      fetchAura();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Trigger animation when aura changes
    setAnimateAura(true);
    const timer = setTimeout(() => setAnimateAura(false), 1000);
    return () => clearTimeout(timer);
  }, [aura]);

  // No longer needed after redesign
  // Keeping the state variables for animation logic

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        {/* Aura Display - Shadcn UI Style */}
        <div className="flex-1 flex justify-center">
          <motion.div
            className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-2 shadow-sm"
            initial={{ scale: 1 }}
            animate={{
              scale: animateAura ? [1, 1.02, 1] : 1,
            }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-base font-medium text-muted-foreground">
              Aura
            </span>
            {isLoading ? (
              <div className="animate-pulse bg-muted h-6 w-20 rounded"></div>
            ) : (
              <motion.div
                className="font-bold text-xl text-foreground flex items-center"
                initial={{ opacity: 1 }}
                animate={{
                  scale: animateAura ? [1, 1.05, 1] : 1,
                }}
                transition={{ duration: 0.5 }}
              >
                <span>{aura.toLocaleString()}</span>
                <motion.span
                  className="ml-1.5 text-xl"
                  animate={{
                    rotate: animateAura ? [0, 10, -10, 0] : 0,
                    scale: animateAura ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  🧠
                </motion.span>
              </motion.div>
            )}
          </motion.div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="/notes"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              Create Study Set
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
