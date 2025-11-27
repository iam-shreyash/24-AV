export function extractMessage(error: any): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (Array.isArray(error)) {
    return error.map((it) => it?.msg || it?.message || JSON.stringify(it)).join("; ");
  }
  if (error?.msg) return error.msg;
  if (error?.message) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
