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
      <section className="noise relative min-h-screen overflow-hidden px-5 pt-24 md:px-8 md:pt-32">
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ink to-transparent" />
        <div className="mx-auto flex flex-col md:grid min-h-[calc(100vh-8rem)] max-w-7xl justify-center gap-10 md:items-center md:gap-12 md:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10 max-w-3xl mt-8 md:mt-0">
            <p className="mb-4 text-xs uppercase tracking-[0.5em] text-zinc-500 md:mb-5">Evolvv Studio</p>
            <h1 className="font-display text-5xl font-bold leading-[0.9] text-bone sm:text-6xl md:text-8xl lg:text-9xl md:leading-[0.88]">
              Wear the Change
            </h1>
            <p className="mt-4 max-w-xl text-base text-zinc-400 sm:text-lg md:text-2xl md:mt-6">
              Different Breed. Different Drip.
            </p>
            <Link
              href="/shop"
              className="focus-ring mt-8 inline-flex bg-bone px-6 py-3 text-xs md:px-8 md:py-4 md:text-sm font-bold uppercase tracking-[0.25em] text-ink transition hover:bg-white hover:shadow-glow md:mt-10"
            >
              Shop Now
            </Link>
          </div>
          <div className="relative z-10 aspect-[4/5] w-full max-w-sm mx-auto md:max-w-none md:w-auto border border-white/10 bg-[url('/products/black-hoodie-1.png')] bg-cover bg-top md:bg-center shadow-glow" />
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
