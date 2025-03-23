import * as React from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function TestCard(props: { question: string | undefined }) {
  const [answer, setAnswer] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/check_answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          question: props.question,
          answer: answer,
        }),
      });
      const data = await response.json();
      console.log("API Response:", data);

      // Check if the response has result property set to true
      const correct = data.result == "true\n";
      console.log(correct);
      setIsCorrect(correct);
      setSubmitted(true);
      
      // Update coins based on result
      try {
        const endpoint = correct ? 
          "http://127.0.0.1:5000/add_coins" : 
          "http://127.0.0.1:5000/remove_coins";
          
        const coinResponse = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: 100
          }),
        });
        
        console.log(`Coins ${correct ? "added" : "removed"}:`, await coinResponse.json());
      } catch (coinError) {
        console.error(`Failed to ${correct ? "add" : "remove"} coins:`, coinError);
      }
    } catch (error) {
      console.error("Failed to check answer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cardBackground = !submitted
    ? "bg-background"
    : isCorrect
      ? "bg-green-100 dark:bg-green-900"
      : "bg-red-100 dark:bg-red-900";

  const textareaBackground = !submitted
    ? "bg-background"
    : isCorrect
      ? "bg-green-50 dark:bg-green-800 border-green-300"
      : "bg-red-50 dark:bg-red-800 border-red-300";

  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={{
        scale: submitted ? [1, 1.03, 1] : 1,
      }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <Card
        className={`w-full h-[50em] transition-colors duration-500 ${cardBackground}`}
      >
        <CardHeader className="text-center pt-10">
          <CardTitle className="text-4xl font-bold mb-4">Question:</CardTitle>
          <CardDescription className="text-4xl font-semibold mt-8 mb-8">
            {props.question}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-2">
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-4 items-center">
                <Label htmlFor="name" className="text-3xl font-bold">
                  Answer
                </Label>
                <motion.textarea
                  id="name"
                  placeholder="Enter your answer here"
                  className={`flex min-h-[200px] w-4/5 rounded-md border px-3 py-2 text-xl shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors duration-500 ${textareaBackground}`}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={submitted}
                  animate={
                    submitted && isCorrect
                      ? {
                          boxShadow: [
                            "0px 0px 0px rgba(0,0,0,0)",
                            "0px 0px 20px rgba(34,197,94,0.6)",
                            "0px 0px 0px rgba(0,0,0,0)",
                          ],
                        }
                      : submitted
                        ? {
                            boxShadow: [
                              "0px 0px 0px rgba(0,0,0,0)",
                              "0px 0px 20px rgba(239,68,68,0.6)",
                              "0px 0px 0px rgba(0,0,0,0)",
                            ],
                          }
                        : {}
                  }
                  transition={{ duration: 1.2, repeat: 0 }}
                />
              </div>
            </div>
            <CardFooter className="flex justify-center mt-20">
              {!submitted ? (
                <Button
                  type="submit"
                  className="w-40 h-16 text-xl"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </Button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center gap-3"
                >
                  <Button
                    className={`w-40 h-16 text-xl ${isCorrect ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
                    disabled
                  >
                    {isCorrect ? "Correct! 🔥" : "Wrong! 💀"}
                  </Button>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ 
                      opacity: 1, 
                      scale: [0.8, 1.2, 1],
                      y: [0, -5, 0]
                    }}
                    transition={{ delay: 0.3, duration: 0.7 }}
                    className={`font-bold text-2xl ${isCorrect ? "text-green-500" : "text-red-500"}`}
                  >
                    <span className="drop-shadow-md">{isCorrect ? "+100 Aura" : "-100 Aura"}</span>
                  </motion.div>
                </motion.div>
              )}
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
