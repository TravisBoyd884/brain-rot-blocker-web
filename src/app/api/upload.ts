// pages/api/uploadStudySet.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/utils/supabase/server";

const uploadStudySet = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = await createClient();
  if (req.method === "POST") {
    const { title } = req.body; // Get title from request body

    if (!req.body.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const file = req.body.file;

    try {
      // Step 1: Upload PDF file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("study-set-files")
        .upload(`history.pdf`, file, { upsert: true });

      if (uploadError) {
        return res
          .status(500)
          .json({ error: "Error uploading file", details: uploadError });
      }

      // Step 2: Get the public URL of the uploaded file
      const fileUrl = supabase.storage
        .from("study-set-files")
        .getPublicUrl("history.pdf");

      // Step 3: Insert study set data into the database
      const { data, error } = await supabase.from("study_sets").insert([
        {
          title: title,
          source_file: fileUrl,
          questions: [],
          answers: [],
        },
      ]);

      if (error) {
        return res
          .status(500)
          .json({
            error: "Error inserting data into study_sets",
            details: error,
          });
      }

      return res
        .status(200)
        .json({ message: "Study set uploaded successfully", data });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Unexpected error", details: error });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
};

export default uploadStudySet;
