import { todayISO } from "@/lib/date";
import { WorkoutForm } from "./workout-form";

export default function NewWorkoutPage() {
  return <WorkoutForm defaultDate={todayISO()} />;
}
