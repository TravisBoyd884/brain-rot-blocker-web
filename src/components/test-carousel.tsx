"use client";
import { useEffect, useState } from "react";
import * as React from "react";

import { TestCard } from "@/components/test-card";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Problem {
  problem: string;
  [key: string]: string;
}

export function TestCarousel(props: { subject: string | undefined }) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://127.0.0.1:5000/question_by_sub", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subject: props.subject }),
        });
        const data = await response.json();
        console.log(data);

        if (data && data.question) {
          const cleanedText = data.question.replace(/```/g, "").trim();
          const cleanerText = cleanedText.replace(/json/g, "").trim();

          try {
            const parsedData = JSON.parse(cleanerText);
            if (parsedData && parsedData.similar_problems) {
              setProblems(parsedData.similar_problems);
            }
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
          }
        }
      } catch (error) {
        console.error("Failed to fetch problems:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, [props.subject]);

  if (isLoading) {
    return (
      <div className="w-[75%] flex justify-center items-center h-96">
        <p className="text-xl">Loading questions...</p>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="w-[75%] flex justify-center items-center h-96">
        <p className="text-xl">No questions available for this subject.</p>
      </div>
    );
  }

  return (
    <Carousel className="w-[75%]">
      <CarouselContent>
        {problems.slice(0, 5).map((problem, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <TestCard question={problem.problem} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
