import SignupForm from "@/components/auth/signup-form";
import TestimonialCard from "@/components/auth/testimonial-card";

export default function SignupPage() {
  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg shadow-2xl overflow-hidden grid md:grid-cols-2 bg-card">
      <SignupForm />
      <TestimonialCard />
    </div>
  );
}
