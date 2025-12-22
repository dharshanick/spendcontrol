import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Star } from "lucide-react";

export default function TestimonialCard() {
  const testimonialAvatar = PlaceHolderImages.find(p => p.id === 'testimonial-avatar');

  return (
    <Card className="hidden lg:flex flex-col items-center justify-center p-8 border-0 bg-card/50 w-full h-full">
      <CardContent className="flex flex-col items-center justify-center text-center gap-4">
        {testimonialAvatar && (
            <Image
                src={testimonialAvatar.imageUrl}
                alt={testimonialAvatar.description}
                data-ai-hint={testimonialAvatar.imageHint}
                width={80}
                height={80}
                className="rounded-full border-2 border-primary"
            />
        )}
        <div className="flex gap-1 text-primary">
            <Star fill="currentColor" className="w-5 h-5" />
            <Star fill="currentColor" className="w-5 h-5" />
            <Star fill="currentColor" className="w-5 h-5" />
            <Star fill="currentColor" className="w-5 h-5" />
            <Star fill="currentColor" className="w-5 h-5" />
        </div>
        <blockquote className="text-lg font-medium italic">
            &quot;Spend Control transformed how I see my finances. It&apos;s intuitive, powerful, and honestly, beautiful to use.&quot;
        </blockquote>
        <p className="text-muted-foreground">- Alex D., Freelance Designer</p>
      </CardContent>
    </Card>
  );
}
