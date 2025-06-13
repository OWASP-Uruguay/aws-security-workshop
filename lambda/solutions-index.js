const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = new S3Client();

const MAX_SIZE_BYTES = 100 * 1024; // 100 KB
const ALLOWED_EXTENSIONS = ['.txt'];

const getExtension = (filename) => {
  const match = filename.match(/\.[^.]+$/);
  return match ? match[0].toLowerCase() : '';
};

exports.handler = async (event) => {
  const timestamp = new Date().toISOString();

  try {
    const body = JSON.parse(event.body || '{}');
    const fileContent = body.content;
    const fileName = body.filename || `upload-${Date.now()}.txt`;

    if (!fileContent) {
      console.warn(`[${timestamp}] Upload blocked: Missing file content`);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing file content.' })
      };
    }

    const extension = getExtension(fileName);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      console.warn(`[${timestamp}] Invalid file type: ${extension}`);
      return { statusCode: 400, body: JSON.stringify({ message: 'Unsupported file type.' }) };
    }

    const buffer = Buffer.from(fileContent, 'utf8');
    if (buffer.length > MAX_SIZE_BYTES) {
      console.warn(`[${timestamp}] File too large: ${buffer.length} bytes`);
      return { statusCode: 413, body: JSON.stringify({ message: 'File too large.' }) };
    }

    await s3.send(new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: fileName,
      Body: fileContent,
      ContentType: 'text/plain'
    }));

    console.info(`[${timestamp}] Uploaded valid file: ${fileName} (${buffer.length} bytes)`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'File uploaded.', file: fileName })
    };
  } catch (err) {
    console.error(`[${timestamp}] Upload failed:`, err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};