import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // service role key bypasses RLS for server-side uploads
);

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'brand-guidelines';

/**
 * Upload a brand guideline file (PDF or DOCX) to Supabase Storage.
 * Returns the public URL of the uploaded file.
 *
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} filename - Original filename
 * @param {string} brandId - Used to namespace the file path
 * @param {string} mimetype - e.g. 'application/pdf'
 */
export async function uploadBrandGuideline({ buffer, filename, brandId, mimetype }) {
  const ext = filename.split('.').pop();
  const path = `${brandId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: mimetype,
      upsert: false,
    });

  if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a file from Supabase Storage.
 * @param {string} path - The storage path returned at upload time
 */
export async function deleteBrandGuideline(path) {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(`Supabase Storage delete failed: ${error.message}`);
}
