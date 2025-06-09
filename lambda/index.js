const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = new S3Client();

exports.handler = async (event) => {
  const body = JSON.parse(event.body || '{}');
  const fileContent = body.content;
  const fileName = body.filename || `upload-${Date.now()}.txt`;

  if (!fileContent) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing file content.' })
    };
  }

  await s3.send(new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
    ContentType: 'text/plain'
  }));

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'File uploaded.', file: fileName })
  };
};