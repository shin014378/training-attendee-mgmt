import {
  defaultInitialSelection,
  ensureInitialData,
  fetchAllEmployees,
  fetchAllTrainings,
} from "@/lib/training-repository";
import { TrainingWorkspace } from "@/components/training/TrainingWorkspace";

export const dynamic = "force-dynamic";

export default async function Page() {
  await ensureInitialData();
  const [trainings, employees] = await Promise.all([
    fetchAllTrainings(),
    fetchAllEmployees(),
  ]);

  const initialSelection = defaultInitialSelection(trainings);

  return (
    <TrainingWorkspace
      trainings={trainings}
      employees={employees}
      initialSelection={initialSelection}
    />
  );
}
