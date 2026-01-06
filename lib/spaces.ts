"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY || "",
    secretAccessKey: process.env.DO_SPACES_SECRET || "",
  },
});

const BUCKET_NAME = process.env.DO_SPACES_BUCKET || "";

export async function uploadFile(
  file: File,
  folder = process.env.DO_SPACES_DOCS_PREFIX
) {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${folder}/${Date.now()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read",
    });

    await s3Client.send(command);

    const fileUrl = `${process.env.DO_SPACES_ENDPOINT}/${BUCKET_NAME}/${key}`;

    return { success: true, url: fileUrl, key: key, error: null };
  } catch (error) {
    console.error(" Error uploading file:", error);
    return {
      success: false,
      url: null,
      key: null,
      error: "Failed to upload file",
    };
  }
}
