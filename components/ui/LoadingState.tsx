import { Loading } from "./Loading";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loading size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}

