import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { GeneratedCertificateResult, sanitizeFileName } from './pdfGenerator';

export async function saveCertificatesToDirectory(
  certificates: GeneratedCertificateResult[],
  folderName: string,
  directoryHandle: FileSystemDirectoryHandle,
  onProgress?: (index: number) => void
): Promise<void> {
  const cleanFolder = sanitizeFileName(folderName || 'Certificados');
  // Create or get subfolder named with the certificate name
  const subDir = await directoryHandle.getDirectoryHandle(cleanFolder, { create: true });

  for (let i = 0; i < certificates.length; i++) {
    const cert = certificates[i];
    const fileHandle = await subDir.getFileHandle(cert.fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(cert.bytes as any);
    await writable.close();
    if (onProgress) {
      onProgress(i + 1);
    }
  }
}

export async function downloadCertificatesAsZip(
  certificates: GeneratedCertificateResult[],
  folderName: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  const cleanFolder = sanitizeFileName(folderName || 'Certificados');
  const zip = new JSZip();
  const folder = zip.folder(cleanFolder);

  if (!folder) {
    throw new Error('No se pudo crear la carpeta en el archivo comprimido.');
  }

  for (const cert of certificates) {
    folder.file(cert.fileName, cert.bytes);
  }

  const blob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  saveAs(blob, `${cleanFolder}.zip`);
}
