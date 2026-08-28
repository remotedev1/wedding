import { deleteImageKitFile, getFileIdFromPath } from '@/lib/imageKit';
import { NextResponse } from 'next/server';
import { readJsonRequest, setupApiHandler } from '@/lib/api/helpers';

export async function DELETE(request) {
  try {
    const setup = await setupApiHandler(request, "media:manage", { enforceRegisteredPolicy: true });
    if (setup.error) return setup.error;
    const { fileId, filePath } = await readJsonRequest(request, 16 * 1024);

    if (!fileId && !filePath) {
      return NextResponse.json(
        { success: false, error: 'File ID or file path is required' },
        { status: 400 }
      );
    }

    let actualFileId = fileId;

    // If filePath is provided instead of fileId, look it up
    if (!actualFileId && filePath) {
      actualFileId = await getFileIdFromPath(filePath);
      if (!actualFileId) {
        return NextResponse.json(
          { success: false, error: 'File not found' },
          { status: 404 }
        );
      }
    }

    // Delete file from ImageKit using REST API
    await deleteImageKitFile(actualFileId);

    return NextResponse.json({ 
      success: true, 
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('ImageKit deletion error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete file' 
      },
      { status: 500 }
    );
  }
}