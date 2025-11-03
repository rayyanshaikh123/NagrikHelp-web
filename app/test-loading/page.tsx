export default async function TestLoadingPage() {
  // simulate a slow server-side render to trigger the app/loading.tsx
  await new Promise((resolve) => setTimeout(resolve, 3000))

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="max-w-xl text-center">
        <h2 className="text-2xl font-semibold">Test page finished loading</h2>
        <p className="mt-2 text-sm text-muted-foreground">This page intentionally waited 3 seconds to demonstrate the loading splash.</p>
      </div>
    </div>
  )
}
