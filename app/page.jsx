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
      <section className="noise relative min-h-screen overflow-hidden px-5 pt-32 md:px-8 md:pt-32">
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ink to-transparent" />
        <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div className="relative z-10 max-w-3xl mt-8 md:mt-0">
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
          <div className="relative z-10 mx-auto flex w-full max-w-sm items-end justify-center lg:max-w-2xl">
            <div className="absolute inset-x-8 bottom-8 top-20 border border-white/10 bg-white/[0.03] shadow-glow lg:inset-x-16 lg:top-24" />
            <img
              src="/products/black-hoodie-1.png"
              alt="Black Evolvv hoodie"
              className="relative z-10 h-auto max-h-[56vh] w-full object-contain object-bottom drop-shadow-[0_28px_70px_rgba(0,0,0,0.75)] sm:max-h-[62vh] lg:max-h-[72vh]"
            />
          </div>
        </div>
      </section>

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
    </>
  );
}
