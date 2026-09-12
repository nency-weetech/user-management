import * as Minio from 'minio';

export async function cleanMinioTestBucket(client: Minio.Client, bucket: string): Promise<void> {
  const objectstream = client.listObjectsV2(bucket, '', true);
  const objectName: string[] = [];

  await new Promise<void>((resolve, reject) => {
    objectstream.on('data', (obj) => {
      if (obj.name) {
        objectName.push(obj.name);
      }
    });
    objectstream.on('end', () => resolve());
    objectstream.on('error', (err) => reject(err));
  });

  if (objectName.length > 0) {
    await client.removeObjects(bucket, objectName);
  }
}