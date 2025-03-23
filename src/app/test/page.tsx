"use client";
import { useEffect } from "react";

export default function Test() {
  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/get_question_by_user",
        );
        const data = await response.json();
        const cleanedText = data.question.replace(/```/g, "").trim();
        const cleanerText = cleanedText.replace(/json/g, "").trim();

        console.log(cleanerText);
        console.log(JSON.parse(cleanerText));
      } catch (error) {
        console.error("Failed to fetch titles:", error);
      }
    };

    fetchTitles();
  }, []);
  return <div>Test</div>;
}
