import { NextResponse } from 'next/server';
import { db, storage } from '@/lib/firebase-admin';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; mediaId: string } }
) {
  try {
    // Get product reference
    const productRef = db.collection('products').doc(params.id);
    const product = await productRef.get();

    if (!product.exists) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const productData = product.data();
    const media = productData?.media || [];

    // Find the media item
    const mediaItem = media.find(m => m.id === params.mediaId);
    if (!mediaItem) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    // Delete from Firebase Storage
    const fileRef = storage.bucket().file(params.mediaId);
    await fileRef.delete().catch(error => {
      console.warn('Error deleting file from storage:', error);
      // Continue even if storage delete fails
    });

    // Remove from product document and reorder remaining media
    const updatedMedia = media
      .filter(m => m.id !== params.mediaId)
      .map((m, index) => ({
        ...m,
        order: index + 1
      }));

    await productRef.update({
      media: updatedMedia,
      updatedAt: new Date()
    });

    return NextResponse.json(
      { message: 'Media deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
