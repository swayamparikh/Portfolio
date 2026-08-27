import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919876543210?text=Hi%20Lustre%2C%20I'd%20like%20to%20book%20a%20detailing%20appointment."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white animate-pulse-ring hover:scale-110 transition-transform"
      aria-label="Chat on WhatsApp"
      style={{ boxShadow: "0 10px 40px -10px rgba(37,211,102,0.6)" }}
    >
      <MessageCircle className="h-6 w-6 fill-white" />
    </a>
  );
}