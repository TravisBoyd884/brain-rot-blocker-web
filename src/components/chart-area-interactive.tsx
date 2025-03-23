"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "An interactive area chart";

// Data before using the app (March 1 - March 15, 2025)
const beforeAppData = Array.from({ length: 15 }, (_, i) => {
  const date = new Date(2025, 2, 1); // March 1, 2025
  date.setDate(date.getDate() + i);
  const dateStr = date.toISOString().split('T')[0];
  
  // YouTube usage high, study time low in the beginning
  const youtube = Math.floor(Math.random() * 300) + 200; // 200-500 minutes
  const study = Math.floor(Math.random() * 150) + 100; // 100-250 minutes
  
  return { date: dateStr, youtube, study };
});

// Data after starting to use the app (March 16 - March 23, 2025)
const afterAppData = Array.from({ length: 8 }, (_, i) => {
  const date = new Date(2025, 2, 16); // March 16, 2025
  date.setDate(date.getDate() + i);
  const dateStr = date.toISOString().split('T')[0];
  
  // Show a dramatic decrease in YouTube usage and increase in study time
  const youtube = Math.floor(Math.random() * 120) + 30; // 30-150 minutes
  const study = Math.floor(Math.random() * 250) + 250; // 250-500 minutes
  
  return { date: dateStr, youtube, study };
});

// Add specific data for March 21st (which might be missing due to date calculation issues)
const march21Data = {
  date: "2025-03-21",
  youtube: 45, // Very low YouTube usage
  study: 420, // Very high study time - nice!
};

// Combine all datasets, ensuring March 21st is included
const allDataWithoutDuplicates = [...beforeAppData, ...afterAppData];
// Remove any existing March 21 entries to avoid duplicates
const filteredData = allDataWithoutDuplicates.filter(item => item.date !== "2025-03-21");
// Add our specific March 21 data
const chartData = [...filteredData, march21Data];

// Sort the data by date to ensure proper display
chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  youtube: {
    label: "YouTube Time (min)",
    color: "var(--destructive)",
  },
  study: {
    label: "Study Time (min)",
    color: "hsl(var(--success))",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isStudy = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isStudy) {
      setTimeRange("7d");
    }
  }, [isStudy]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2025-03-23"); // End date (March 23, 2025)
    let daysToSubtract = 23; // Show the full month by default
    if (timeRange === "30d") {
      daysToSubtract = 30; // Will show all available data
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Study/Youtube Minutes</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Brain Rot Blocker Impact: Notice the dramatic shift after March 15, 2025
          </span>
          <span className="@[540px]/card:hidden">App Impact: See the difference!</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Full month</ToggleGroupItem>
            <ToggleGroupItem value="30d">All data</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Full month" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Full month
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                All data
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillYoutube" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--destructive)"
                  stopOpacity={0.7}
                />
                <stop
                  offset="95%"
                  stopColor="var(--destructive)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillStudy" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--success))"
                  stopOpacity={0.7}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--success))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={0} // Reduced gap to show more tick marks
              ticks={chartData.map(item => item.date)} // Force display of all dates
              tickFormatter={(value) => {
                const date = new Date(value);
                const formattedDate = date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                // Highlight March 21st
                return date.getDate() === 21 && date.getMonth() === 2 
                  ? `★ ${formattedDate} ★` 
                  : formattedDate;
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={20} // Show tooltip on March 21st by default
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    const formattedDate = date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                    
                    // Add special indicator for before/after app adoption
                    const isAfterAppAdoption = date >= new Date(2025, 2, 16); // March 16, 2025
                    return `${formattedDate} ${isAfterAppAdoption ? "✅" : "❌"}`;
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="study"
              type="natural"
              fill="url(#fillStudy)"
              stroke="hsl(var(--success))"
              strokeWidth={2}
            />
            <Area
              dataKey="youtube"
              type="natural"
              fill="url(#fillYoutube)"
              stroke="var(--destructive)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
