import { toast as sonnerToast } from "sonner";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = ({ title, description, variant = "default" }: ToastOptions) => {
    const message = title || description || "";
    const options = title && description ? { description } : undefined;

    if (variant === "destructive") {
      sonnerToast.error(message, options);
    } else {
      sonnerToast.success(message, options);
    }
  };

  return { toast };
}
