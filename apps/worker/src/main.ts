export async function startWorker(): Promise<void> {
  return;
}

if (import.meta.main) {
  await startWorker();
}
