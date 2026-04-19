import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET = 'fiscord-facturas';

export type UploadResult = { url: string; path: string };

export async function uploadFacturaPhoto(
  file: File,
  userId: string,
  facturaId: string,
): Promise<UploadResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${userId}/${facturaId}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) throw new Error(`Upload falló: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { url: data.publicUrl, path };
}

export async function deleteFacturaPhoto(path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path]);
}
