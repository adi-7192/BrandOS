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
export async function uploadBrandGuideline({ buffer, filename, brandId, resourceKey, mimetype }) {
  const ext = filename.split('.').pop();
  const namespace = resourceKey || brandId || 'brand-guidelines';
  const safeFilename = String(filename || 'guideline')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9-_]+/gi, '-')
    .toLowerCase();
  const path = `${namespace}/${Date.now()}-${safeFilename}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: mimetype,
      upsert: false,
    });

  if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl, path };
}

/**
 * Delete a file from Supabase Storage.
 * @param {string} path - The storage path returned at upload time
 */
export async function deleteBrandGuideline(path) {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(`Supabase Storage delete failed: ${error.message}`);
}
