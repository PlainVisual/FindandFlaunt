// @/components/layout/AppFooter.tsx
"use client";

import { useState, useEffect } from 'react';

export function AppFooter() {
  const [currentYear, setCurrentYear] = useState<number | string>('');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="py-6 mt-12 border-t bg-muted/50">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>&copy; {currentYear} Find&Flaunt. All rights reserved.</p>
      </div>
    </footer>
  );
}
