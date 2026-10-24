import { TexturePanel } from "@/components/ui/texture-panel";
import { TestimonialsCarousel } from "./testimonials-carousel";

export function Testimonials() {
  return <TestimonialsCarousel background={<TexturePanel tone="charcoal" />} />;
}
