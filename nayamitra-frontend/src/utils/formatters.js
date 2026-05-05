export function formatDocId(uuid) {
  if (!uuid) return '';
  // Convert 168a7040-25a2-4dc2-9291-abd83fe9d34c -> DOC-168a70
  return `DOC-${uuid.substring(0, 6).toUpperCase()}`;
}

export function formatUserId(uuid) {
  if (!uuid) return '';
  return `USR-${uuid.substring(0, 6).toUpperCase()}`;
}

export function formatFileName(path) {
  if (!path) return '';
  // Convert uploads/168a7040-25a2-4dc2-9291-abd83fe9d34c_legal_dataset(2025).pdf -> legal_dataset(2025).pdf
  const parts = path.split('/');
  let filename = parts[parts.length - 1];
  // remove the UUID prefix if it exists
  const underscoreIndex = filename.indexOf('_');
  if (underscoreIndex > 0 && underscoreIndex < 40) {
    filename = filename.substring(underscoreIndex + 1);
  }
  return filename;
}
