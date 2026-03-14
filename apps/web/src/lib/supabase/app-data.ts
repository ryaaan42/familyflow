import type { DemoDataset, Task } from "@familyflow/shared";
import { buildPdfDatasetForCurrentUser } from "@/lib/pdf/build-pdf-dataset";

export async function getAppDatasetForCurrentUser(): Promise<DemoDataset | null> {
  return buildPdfDatasetForCurrentUser();
}

export async function ensureTasksForHousehold(dataset: DemoDataset): Promise<Task[]> {
  return dataset.tasks;
}
