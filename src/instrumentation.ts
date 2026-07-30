export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const cron = await import("node-cron");
  const { runMatchingPipelineForAllUsers } = await import("@/lib/pipeline");

  // Var 5:e timme - några gånger per dag utan att pressa LLM-/API-kostnaden.
  cron.schedule("0 */5 * * *", () => {
    runMatchingPipelineForAllUsers().catch((err) => {
      console.error("Schemalagd matchningspipeline misslyckades", err);
    });
  });
}
