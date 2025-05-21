import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="py-4 md:py-6 shadow-md bg-card sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl md:text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          <Sparkles className="h-7 w-7 md:h-8 md:w-8" />
          <span>StyleSavvy Shopper</span>
        </Link>
        {/* Future navigation links can go here */}
      </div>
    </header>
  );
}
