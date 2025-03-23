import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const file = formData.get("file") as File;

    if (!title || !file) {
      return NextResponse.json(
        { error: "Title and file are required" },
        { status: 400 }
      );
    }

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);
    
    // Create a unique filename
    const filename = `${Date.now()}-${file.name}`;

    // Step 1: Upload PDF file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("study-set-files")
      .upload(filename, fileBuffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      return NextResponse.json(
        { error: "Error uploading file", details: uploadError },
        { status: 500 }
      );
    }

    // Step 2: Get the public URL of the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from("study-set-files")
      .getPublicUrl(filename);

    // Step 3: Insert study set data into the database
    const { data, error } = await supabase.from("study_sets").insert([
      {
        title: title,
        source_file: publicUrl,
        questions: [],
        answers: [],
        created_at: new Date().toISOString(),
      },
    ]).select();

    if (error) {
      return NextResponse.json(
        { error: "Error inserting data into study_sets", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: "Study set uploaded successfully", 
      data 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Unexpected error", details: String(error) },
      { status: 500 }
    );
  }
}