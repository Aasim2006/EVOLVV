import Link from "next/link";
import MotionSection from "@/components/MotionSection";
import ProductGrid from "@/components/ProductGrid";
import { featuredProducts } from "@/lib/sample-data";

export default function HomePage() {
  const firstDropProducts = ["Hoodies", "Tees", "Polo T-Shirts", "Caps"]
    .map((category) => featuredProducts.find((product) => product.category === category))
    .filter(Boolean);

  return (
    <>
      <section className="noise relative overflow-hidden px-5 pb-16 pt-28 md:min-h-screen md:px-8 md:pb-0 md:pt-32">
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ink to-transparent" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:min-h-[calc(100vh-8rem)]">
          <div className="relative z-10 max-w-3xl md:mt-0">
            <p className="mb-4 text-xs uppercase tracking-[0.5em] text-zinc-500 md:mb-5">Evolvv Studio</p>
            <h1 className="font-display text-5xl font-bold leading-[0.9] text-bone sm:text-6xl md:text-8xl xl:text-9xl md:leading-[0.88]">
              Wear the Change
            </h1>
            <p className="mt-4 max-w-xl text-base text-zinc-400 sm:text-lg md:text-2xl md:mt-6">
              Different Breed. Different Drip.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 md:mt-10">
              <Link
                href="/shop"
                className="focus-ring inline-flex bg-bone px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-ink transition hover:bg-white hover:shadow-glow md:px-8 md:py-4 md:text-sm"
              >
                Shop Now
              </Link>
              <Link
                href="/image-generator"
                className="focus-ring inline-flex border border-white/20 px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-bone transition hover:border-white/40 hover:bg-white/5 md:px-8 md:py-4 md:text-sm"
              >
                Personalize
              </Link>
            </div>
            <div className="mt-6 max-w-xl border-l border-bone/60 pl-4">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-bone">Personalize your product</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400 md:text-base">
                Upload your own design, preview the mockup, and order a custom tee or hoodie.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MotionSection className="bg-ink px-5 pb-8 pt-4 md:px-8 md:pb-16">
        <div className="mx-auto grid max-w-7xl gap-8 border-y border-white/10 py-8 md:grid-cols-[0.9fr_1.1fr] md:items-center md:py-12">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Custom Hoodie</p>
            <h2 className="mt-3 font-display text-4xl leading-none text-bone md:text-6xl">
              Make the back yours
            </h2>
            <p className="mt-4 max-w-lg text-zinc-400">
              Upload your design and preview a bold back-print hoodie before checkout.
            </p>
            <Link
              href="/image-generator"
              className="focus-ring mt-7 inline-flex bg-bone px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-ink transition hover:bg-white md:px-8 md:py-4 md:text-sm"
            >
              Customize Now
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-xl overflow-hidden border border-white/10 bg-white/[0.03] p-4 shadow-glow">
            <div className="relative aspect-square overflow-hidden bg-[#e8e7e5]">
              <img
                src="/products/custom-hoodie-hero.jpeg"
                alt="Custom black hoodie back mockup"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="bg-ink px-5 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Featured</p>
              <h2 className="mt-3 font-display text-4xl text-bone md:text-6xl">First Drop</h2>
            </div>
            <p className="max-w-md text-zinc-400">
              Monochrome essentials designed for motion, late nights, and quiet confidence.
            </p>
          </div>
          <ProductGrid products={firstDropProducts} />
        </div>
      </MotionSection>

      <MotionSection className="border-y border-white/10 bg-bone px-5 py-20 text-ink md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          {["Limited drops", "Premium weight", "Built to evolve"].map((item) => (
            <div key={item}>
              <p className="font-display text-2xl">{item}</p>
              <p className="mt-3 text-sm text-zinc-700">
                Sharp silhouettes, tactile fabrics, and restraint where it matters.
              </p>
            </div>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="bg-ink px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 border-y border-white/10 py-12 md:grid-cols-[0.85fr_1.15fr] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Contact Us</p>
            <h2 className="mt-3 font-display text-4xl text-bone md:text-6xl">Stay Connected</h2>
          </div>
          <div className="grid gap-4 text-lg text-zinc-300">
            <a
              href="https://www.instagram.com/evolvv.style?igsh=d2hvdDFseng0MHR1"
              target="_blank"
              rel="noreferrer"
              className="focus-ring border border-white/10 px-5 py-4 transition hover:border-white/30 hover:text-bone"
            >
              Instagram: evolvv.style
            </a>
            <a
              href="mailto:evolvv.style@gmail.com"
              className="focus-ring border border-white/10 px-5 py-4 transition hover:border-white/30 hover:text-bone"
            >
              Email: evolvv.style@gmail.com
            </a>
          </div>
        </div>
      </MotionSection>
    </>
  );
}
