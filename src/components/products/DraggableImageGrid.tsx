'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';

interface SortableImageProps {
  url: string;
  id: string;
  onRemove: () => void;
}

function SortableImage({ url, id, onRemove }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div className="relative">
      <div
        ref={setNodeRef}
        style={style}
        className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
        {...attributes}
        {...listeners}
      >
        <Image
          src={url}
          alt="Product image"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={100}
          priority={true}
        />
      </div>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 rounded-full shadow-lg hover:shadow-xl z-50"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface DraggableImageGridProps {
  images: { id: string; url: string }[];
  onReorder: (newOrder: { id: string; url: string }[]) => void;
  onRemove: (id: string) => void;
  children?: React.ReactNode;
}

export default function DraggableImageGrid({
  images,
  onReorder,
  onRemove,
  children,
}: DraggableImageGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((item) => item.id === active.id);
      const newIndex = images.findIndex((item) => item.id === over.id);
      onReorder(arrayMove(images, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-3 gap-4">
        <SortableContext items={images} strategy={rectSortingStrategy}>
          {images.map((image) => (
            <SortableImage
              key={image.id}
              id={image.id}
              url={image.url}
              onRemove={() => onRemove(image.id)}
            />
          ))}
        </SortableContext>
        {children}
      </div>
    </DndContext>
  );
}
