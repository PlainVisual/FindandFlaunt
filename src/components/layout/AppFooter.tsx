export function AppFooter() {
  return (
    <footer className="py-6 mt-12 border-t bg-muted/50">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} StyleSavvy Shopper. All rights reserved.</p>
        <p className="mt-1">Powered by AI with style.</p>
      </div>
    </footer>
  );
}
