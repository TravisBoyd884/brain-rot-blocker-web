"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CreateSet() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !title) {
      setError("Please provide both a title and a file");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      console.log(file);
      formData.append("subject", title);
      formData.append("file", file);

      const response = await fetch("http://127.0.0.1:5000/file_to_gemini", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload");
      }

      setSuccess("Study set uploaded successfully!");
      setTitle("");
      setFile(null);
      // Reset the file input by clearing its value
      const fileInput = document.getElementById(
        "study-file",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Refresh the section cards to show the newly added study set
      // @ts-expect-error
      if (window.refreshSectionCards) {
        // @ts-expect-error
        window.refreshSectionCards();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full h-fit">
      <CardHeader>
        <CardTitle>Generate New Study Set</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="study-file">Upload PDF</Label>
              <Input
                id="study-file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <Button type="submit" disabled={isUploading} className="w-full">
              {isUploading ? "Uploading..." : "Upload Study Set"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
