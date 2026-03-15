const PDF_HEADER = Buffer.from('%PDF', 'utf8');

export async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  if (buffer.length < 4 || !buffer.subarray(0, 4).equals(PDF_HEADER)) {
    throw new Error(
      'This file doesn\'t look like a valid PDF. Please upload a real PDF file (not a Word doc renamed as .pdf, and not an image).'
    );
  }

  try {
    const { createRequire } = await import('node:module');
    const require = createRequire(process.cwd() + '/package.json');
    const { PDFParse } = require('pdf-parse');
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const textResult = await parser.getText();
    const text = textResult.text ?? '';
    await parser.destroy();
    return text;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("PDF Parsing Error:", error);

    if (
      message.includes('Invalid PDF') ||
      message.includes('InvalidPDFException') ||
      message.includes('PDF structure')
    ) {
      throw new Error(
        'The file isn\'t a valid or supported PDF. Try saving as PDF again from your app, or use a different PDF file.'
      );
    }
    throw new Error(`Failed to extract text from PDF. ${message}`);
  }
}
