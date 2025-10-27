import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT, // ex: https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com
    credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
},
forcePathStyle: false,
});

export async function getPresignedPutUrl(bucket: string, key: string, expiresSeconds = 900) {
    const cmd = new PutObjectCommand({ 
        Bucket: bucket, 
        Key: key,
        // Add CORS headers to allow browser uploads
        ContentType: 'application/octet-stream',
    });
    return getSignedUrl(r2Client, cmd, { expiresIn: expiresSeconds });
}

export async function getPresignedGetUrl(bucket: string, key: string, expiresSeconds = 60) {
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(r2Client, cmd, { expiresIn: expiresSeconds });
}

export async function deleteObject(bucket: string, key: string) {
    const cmd = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    return r2Client.send(cmd);
}