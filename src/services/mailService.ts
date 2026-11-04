const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycby30naTMhhF4JUkcPnOSi70clAQ5YV7Zr3UXroj9zuyU3zf_uzgskkJvD-llz02w7kQ/exec';

export interface SendMailParams {
  subject: string;
  fields: Record<string, string>;
  file?: File | null;
}

export interface GoogleScriptResponse {
  status: 'success' | 'error';
  message?: string;
  [key: string]: unknown;
}

export const sendToGoogleScript = async ({
  subject,
  fields,
  file,
}: SendMailParams): Promise<GoogleScriptResponse> => {
  let fileData: { name: string; mimeType: string; base64: string } | null = null;

  if (file) {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data:...;base64, prefix
        const base64Clean = result.split(',')[1] || result;
        resolve(base64Clean);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

    fileData = {
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      base64,
    };
  }

  const payload = {
    subject,
    fields,
    file: fileData,
  };

  // Using text/plain;charset=utf-8 is crucial to avoid CORS preflight (OPTIONS) rejection by Google Apps Script
  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
  }

  let data: GoogleScriptResponse;
  try {
    data = (await response.json()) as GoogleScriptResponse;
  } catch {
    // If response body is text or HTML output from Apps Script
    const rawText = await response.text().catch(() => '');
    try {
      data = JSON.parse(rawText) as GoogleScriptResponse;
    } catch {
      data = { status: 'success', raw: rawText };
    }
  }

  if (data && data.status === 'error') {
    throw new Error(data.message || 'Ошибка отправки письма через Google Script');
  }

  return data;
};
