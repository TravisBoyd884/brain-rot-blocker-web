'use client';

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TestCarousel } from "@/components/test-carousel";
import { SiteHeader } from "@/components/site-header";
import { AppSidebar } from "@/components/app-sidebar";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function TestContent() {
  const searchParams = useSearchParams();
  const subject = searchParams.get('subject') || 'Geography';

  return (
    <div className="w-full h-full flex justify-center items-center">
      <TestCarousel subject={subject} />
    </div>
  );
}

export default function Test() {
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
        <Suspense fallback={<div>Loading...</div>}>
          <TestContent />
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  );
}
