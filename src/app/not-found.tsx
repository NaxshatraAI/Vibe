const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-background px-6 text-foreground">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold">This page could not be found.</h1>
      <p className="text-muted-foreground">Double-check the URL or return home.</p>
    </div>
  );
};

export default NotFound;