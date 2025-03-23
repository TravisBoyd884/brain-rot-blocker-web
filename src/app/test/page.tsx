'use client';

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TestCarousel } from "@/components/test-carousel";
import { SiteHeader } from "@/components/site-header";
import { AppSidebar } from "@/components/app-sidebar";
import { useSearchParams } from 'next/navigation';

export default function Test() {
  const searchParams = useSearchParams();
  const subject = searchParams.get('subject') || 'Geography';

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="w-full h-full flex justify-center items-center">
          <TestCarousel subject={subject} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
