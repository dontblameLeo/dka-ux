import { TaskStatus } from "../App";

export function formatTextWithCapitalization(text: string) {
  if (!text) return text;

  const modifiedText = text.toLowerCase().replace(/_/g, " ");
  const capitalizedText =
    modifiedText.charAt(0).toUpperCase() + modifiedText.slice(1);

  return capitalizedText.replace(/(\s\w)/g, (match) => match.toUpperCase());
}

export function checkColor(status: string) {
  if (status === TaskStatus.AllTasks) return undefined;
  return status === TaskStatus.Todo
    ? "neutral"
    : status === TaskStatus.Doing
      ? "warning"
      : "success";
}
