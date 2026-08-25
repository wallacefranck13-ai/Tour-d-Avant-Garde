import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

export interface StoredFile {
  /** Chemin relatif ou URL absolue à renvoyer au client (stocké tel quel en base). */
  path: string;
}

/**
 * Abstraction de stockage de fichiers : local disque par défaut (aucune
 * configuration requise), ou S3/compatible (MinIO, R2, Spaces...) dès que
 * S3_BUCKET est renseigné dans .env. Même pattern que WhatsappApiService :
 * fonctionne sans configuration, s'active dès que les identifiants arrivent.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3?: S3Client;
  private readonly bucket?: string;
  private readonly publicUrlBase?: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('S3_BUCKET') || undefined;
    if (this.bucket) {
      this.s3 = new S3Client({
        region: this.config.get<string>('S3_REGION', 'auto'),
        endpoint: this.config.get<string>('S3_ENDPOINT') || undefined,
        forcePathStyle: this.config.get<string>('S3_FORCE_PATH_STYLE') === 'true',
        credentials: {
          accessKeyId: this.config.get<string>('S3_ACCESS_KEY_ID', ''),
          secretAccessKey: this.config.get<string>('S3_SECRET_ACCESS_KEY', ''),
        },
      });
      this.publicUrlBase = this.config.get<string>('S3_PUBLIC_URL_BASE');
      this.logger.log(`Stockage média : S3 (bucket "${this.bucket}")`);
    } else {
      this.logger.log('Stockage média : disque local (S3_BUCKET non configuré)');
    }
  }

  private isS3Configured() {
    return Boolean(this.s3 && this.bucket);
  }

  async save(buffer: Buffer, folder: string, originalName: string, mimetype: string): Promise<StoredFile> {
    const ext = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.')) : '';
    const filename = `${randomUUID()}${ext}`;
    const key = `${folder}/${filename}`;

    if (this.isS3Configured()) {
      await this.s3!.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: buffer, ContentType: mimetype }));
      const url = this.publicUrlBase ? `${this.publicUrlBase.replace(/\/$/, '')}/${key}` : key;
      return { path: url };
    }

    const dir = join(process.cwd(), 'uploads', folder);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, filename), buffer);
    return { path: `/uploads/${folder}/${filename}` };
  }
}
