'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NewBookPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from('library_books').insert({
      title: formData.get('title') as string,
      author: formData.get('author') as string,
      isbn: formData.get('isbn') as string,
      category: formData.get('category') as string,
      total_copies: parseInt(formData.get('total_copies') as string),
      available_copies: parseInt(formData.get('total_copies') as string),
      shelf_location: formData.get('shelf_location') as string,
      status: 'available',
    });

    if (error) {
      toast.error('Failed to add book');
      setLoading(false);
      return;
    }

    toast.success('Book added successfully');
    router.push('/library');
    router.refresh();
  };

  return (
    <>
      <PageHeader title="Add Book" description="Add a new book to the library" />

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input name="title" required placeholder="Book title" />
              </div>
              <div className="space-y-2">
                <Label>Author</Label>
                <Input name="author" required placeholder="Author name" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>ISBN</Label>
                <Input name="isbn" placeholder="ISBN number" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input name="category" required placeholder="e.g. Science, Fiction, History" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Total Copies</Label>
                <Input name="total_copies" type="number" min="1" required defaultValue="1" />
              </div>
              <div className="space-y-2">
                <Label>Shelf Location</Label>
                <Input name="shelf_location" placeholder="e.g. Shelf A-3" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Book
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
