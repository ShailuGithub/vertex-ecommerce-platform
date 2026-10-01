import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Hero({ shopHref }: { shopHref: string }) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-primary mb-4">
        Discover today&apos;s best deals
      </h1>
      <p className="text-muted-foreground text-lg mb-8">Quality picks at prices you&apos;ll love</p>
      <Button asChild size="lg" className="rounded-full px-8">
        <Link href={shopHref}>Shop Now</Link>
      </Button>
    </section>
  );
}
