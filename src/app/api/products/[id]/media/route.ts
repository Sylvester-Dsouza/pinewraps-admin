import { NextResponse } from 'next/server';
import { db, storage } from '@/lib/firebase-admin';
import { z } from 'zod';

// Validation schema for media reordering
const reorderSchema = z.object({
  mediaOrder: z.array(z.object({
    mediaId: z.string(),
    order: z.number().min(1)
  }))
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { nanoid } = await import('nanoid');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const order = parseInt(formData.get('order') as string) || null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Get product reference
    const productRef = db.collection('products').doc(params.id);
    const product = await productRef.get();

    if (!product.exists) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Upload file to Firebase Storage
    const buffer = await file.arrayBuffer();
    const fileExt = file.name.split('.').pop();
    const mediaId = nanoid();
    const fileName = `products/${params.id}/${mediaId}.${fileExt}`;

    // Upload to Firebase Storage
    const fileRef = storage.bucket().file(fileName);
    await fileRef.save(Buffer.from(buffer), {
      metadata: {
        contentType: file.type,
      },
    });

    // Get the public URL
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '01-01-2500', // Far future expiration
    });

    // Update product with new media
    const productData = product.data() || {};
    const media = productData.media || [];
    const newMedia = {
      id: mediaId,
      url,
      order: order || media.length + 1,
      fileName
    };

    await productRef.update({
      media: [...media, newMedia],
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      data: { media: newMedia }
    });

  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { mediaOrder } = reorderSchema.parse(body);

    // Get product reference
    const productRef = db.collection('products').doc(params.id);
    const product = await productRef.get();

    if (!product.exists) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const productData = product.data() || {};
    const media = productData.media || [];

    // Update media order
    const updatedMedia = media.map(item => {
      const orderItem = mediaOrder.find(o => o.mediaId === item.id);
      if (orderItem) {
        return { ...item, order: orderItem.order };
      }
      return item;
    });

    // Sort media by order
    updatedMedia.sort((a, b) => (a.order || 0) - (b.order || 0));

    await productRef.update({
      media: updatedMedia,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      data: { media: updatedMedia }
    });

  } catch (error) {
    console.error('Error reordering media:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to reorder media' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const mediaId = url.searchParams.get('mediaId');

    if (!mediaId) {
      return NextResponse.json(
        { success: false, error: 'Media ID is required' },
        { status: 400 }
      );
    }

    // Get product reference
    const productRef = db.collection('products').doc(params.id);
    const product = await productRef.get();

    if (!product.exists) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const productData = product.data() || {};
    const media = productData.media || [];
    const mediaItem = media.find(item => item.id === mediaId);

    if (!mediaItem) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      );
    }

    // Delete from Firebase Storage
    if (mediaItem.fileName) {
      try {
        await storage.bucket().file(mediaItem.fileName).delete();
      } catch (error) {
        console.error('Error deleting file from storage:', error);
      }
    }

    // Remove media from product
    const updatedMedia = media.filter(item => item.id !== mediaId);
    await productRef.update({
      media: updatedMedia,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      data: { mediaId }
    });

  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
