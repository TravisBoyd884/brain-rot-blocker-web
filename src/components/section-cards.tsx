"use client";
import { IconMoodCheck } from "@tabler/icons-react";
import { useEffect, useState } from "react";
// import { createClient } from "@/utils/supabase/server";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function UniqueCard({
  title,
  numTerms,
  lastStudied,
  score,
}: {
  title: string;
  numTerms: number;
  lastStudied: string;
  score: number;
}) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Study Set</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          <a href={`/test?subject=${encodeURIComponent(title)}`}>{title}</a>
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <IconMoodCheck />
            Last Test Score: {score}%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Number of terms: {numTerms}
        </div>
        <div className="text-muted-foreground">Last Studied: {lastStudied}</div>
      </CardFooter>
    </Card>
  );
}

export function SectionCards() {
  // const supabase = await createClient();
  // const { data: notes } = await supabase.from("notes").select("title");
  // const { data: noteWithId1 } = await supabase
  //   .from("notes")
  //   .select("title")
  //   .eq("id", 1)
  //   .single();
  //
  //
  const [titles, setTitles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to refresh the section cards
  const refreshSectionCards = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Expose the refresh function to the window object so it can be called from other components
  useEffect(() => {
    // @ts-expect-error: Type mismatch due to library bug
    window.refreshSectionCards = refreshSectionCards;
    return () => {
      // @ts-expect-error: Type mismatch due to library bug
      delete window.refreshSectionCards;
    };
  }, []);

  useEffect(() => {
    const fetchTitles = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/get_subjects_by_user",
        );
        const data = await response.json();

        // Count occurrences of each subject
        const frequencyMap: Record<string, number> = {};
        data.forEach((subject: string) => {
          frequencyMap[subject] = (frequencyMap[subject] || 0) + 1;
        });

        // Sort subjects by frequency in descending order
        const sortedTitles = Object.entries(frequencyMap)
          .sort((a, b) => b[1] - a[1]) // Sort by frequency
          .map(([subject]) => subject); // Extract subject names

        // Take the top 4 subjects
        setTitles(sortedTitles.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch titles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTitles();
  }, [refreshTrigger]); // Refresh when the trigger changes

  // Skeleton loader for cards
  const CardSkeleton = () => (
    <Card className="@container/card animate-pulse">
      <CardHeader>
        <div className="h-4 w-20 bg-muted rounded mb-2"></div>
        <div className="h-8 w-3/4 bg-muted rounded"></div>
        <CardAction>
          <div className="h-6 w-32 bg-muted rounded"></div>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5">
        <div className="h-4 w-40 bg-muted rounded"></div>
        <div className="h-4 w-32 bg-muted rounded"></div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="grid grid-cols-2 gap-4 px-4 lg:px-6">
      {isLoading ? (
        // Show skeletons while loading
        Array(4)
          .fill(0)
          .map((_, index) => <CardSkeleton key={`skeleton-${index}`} />)
      ) : titles.length > 0 ? (
        // Show actual cards when loaded
        titles.map((title, index) => (
          <UniqueCard
            key={index}
            title={title}
            numTerms={10}
            lastStudied="April 24, 2024"
            score={80}
          />
        ))
      ) : (
        // Show message when no cards are available
        <div className="col-span-2 text-center py-10">
          <p className="text-muted-foreground">
            No study sets found. Create one to get started!
          </p>
        </div>
      )}
    </div>
  );
}
