"use client";

import { useMemo, useRef, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { featuredProducts } from "@/lib/sample-data";

const shirtColors = [
  { name: "Bone", value: "#F6F4EF", ink: "#050505" },
  { name: "Ink", value: "#080808", ink: "#F6F4EF" },
  { name: "Graphite", value: "#232323", ink: "#F6F4EF" },
  { name: "Ash", value: "#A3A3A3", ink: "#050505" }
];

const CUSTOMIZATION_FEE = 120;

export default function ImageGeneratorClient() {
  const { addItem } = useCart();
  const products = useMemo(
    () => featuredProducts.filter((product) => ["Hoodies", "Tees"].includes(product.category)),
    []
  );
  const [selectedProductId, setSelectedProductId] = useState(products[0]?._id || "");
  const [shirtColor] = useState(shirtColors[0]);
  const [designUrl, setDesignUrl] = useState("");
  const [designName, setDesignName] = useState("");
  const [designScale, setDesignScale] = useState(58);
  const [designY, setDesignY] = useState(48);
  const [blendedImageUrl, setBlendedImageUrl] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [blending, setBlending] = useState(false);
  const [adding, setAdding] = useState(false);
  const fileInputRef = useRef(null);

  const selectedProduct = products.find((product) => product._id === selectedProductId) || products[0];
  const selectedImages = getProductImages(selectedProduct);

  function uploadDesign(event) {
    const file = event.target.files?.[0];
    setError("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Upload a PNG, JPG, SVG, or WebP design.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDesignUrl(reader.result);
      setDesignName(file.name);
      setBlendedImageUrl("");
      setNotice("");
    };
    reader.readAsDataURL(file);
  }

  async function downloadMockup() {
    const imageUrl = blendedImageUrl || (await createMockupImage());
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "evolvv-custom-tshirt.png";
    link.click();
  }

  async function blendWithAi() {
    if (!designUrl) {
      setError("Upload a back design before using AI blend.");
      return;
    }

    setError("");
    setNotice("");
    setBlending(true);

    try {
      const mockupImage = await createAiReferenceImage({
        productName: selectedProduct?.name || "Custom T-Shirt",
        shirtColor,
        designUrl,
        productImage: selectedImages[1] || selectedImages[0],
        designScale,
        designY
      });
      const designImage = await removeFlatBackgroundDataUrl(designUrl, 512);
      const response = await fetch("/api/image-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "blend",
          mockupImage,
          designImage,
          productName: selectedProduct?.name,
          shirtColor: shirtColor.name,
          quality: "medium"
        })
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.code === "CONTENT_FILTERED") {
          setNotice("AI blend was blocked for this design. You can still add the regular mockup to cart.");
        } else {
          setError(data.error || "AI blend failed.");
        }
        return;
      }

      setBlendedImageUrl(data.imageUrl);
      setNotice("AI blended design ready.");
    } catch {
      setError("AI blend failed.");
    } finally {
      setBlending(false);
    }
  }

  async function addMockupToCart() {
    if (!designUrl) {
      setError("Upload a back design before adding this custom shirt to cart.");
      return;
    }

    setError("");
    setNotice("");
    setAdding(true);

    try {
      const mockupImage = blendedImageUrl || (await createMockupImage());
      const cartImage = mockupImage.startsWith("data:image/")
        ? await compressImageDataUrl(mockupImage, 720)
        : mockupImage;
      const designImage = await compressImageDataUrl(designUrl, 720);
      const basePrice = selectedProduct?.price || 400;
      addItem(
        {
          _id: `custom-${Date.now()}`,
          name: `Custom ${selectedProduct?.name || "T-Shirt"}`,
          price: basePrice + CUSTOMIZATION_FEE,
          basePrice,
          customizationFee: CUSTOMIZATION_FEE,
          image: cartImage,
          mockupImage: cartImage,
          designImage,
          designName,
          custom: true
        },
        "Custom"
      );
      setNotice("Custom shirt added to cart.");
    } catch {
      setError("Could not add the custom shirt to cart.");
    } finally {
      setAdding(false);
    }
  }

  async function createMockupImage() {
    return createMockupDataUrl({
      productName: selectedProduct?.name || "Custom T-Shirt",
      shirtColor,
      designUrl,
      productImage: selectedImages[1] || selectedImages[0],
      designScale,
      designY
    });
  }

  return (
    <section className="noise min-h-screen bg-ink px-5 pb-24 pt-32 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[390px_1fr]">
        <aside className="h-fit border border-white/10 bg-smoke p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">Create</p>
          <h1 className="mt-3 font-display text-4xl leading-none text-bone md:text-5xl">
            Custom
          </h1>

          <label className="mt-8 block text-sm text-zinc-400">
            Choose product
            <select
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
              className="focus-ring mt-2 w-full border border-white/15 bg-ink px-4 py-3 text-bone"
            >
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-6">
            <p className="text-sm text-zinc-400">Back design</p>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadDesign} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="focus-ring mt-2 w-full border border-white/20 px-4 py-3 text-sm uppercase tracking-[0.18em] text-bone transition hover:bg-bone hover:text-ink"
            >
              Upload Design
            </button>
            {designName ? <p className="mt-2 truncate text-xs text-zinc-500">{designName}</p> : null}
          </div>

          <Control label="Design size" value={designScale} min="30" max="95" onChange={setDesignScale} />
          <Control label="Back position" value={designY} min="25" max="72" onChange={setDesignY} />

          {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
          {notice ? <p className="mt-4 text-sm text-emerald-300">{notice}</p> : null}

          <button
            type="button"
            onClick={blendWithAi}
            disabled={blending}
            className="focus-ring mt-7 w-full border border-white/20 px-5 py-4 text-sm font-bold uppercase tracking-[0.2em] text-bone transition hover:bg-bone hover:text-ink disabled:cursor-wait disabled:opacity-60"
          >
            {blending ? "Blending..." : "AI Blend Design"}
          </button>

          <button
            type="button"
            onClick={addMockupToCart}
            disabled={adding}
            className="focus-ring mt-3 w-full bg-bone px-5 py-4 text-sm font-bold uppercase tracking-[0.22em] text-ink transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
          >
            {adding ? "Adding..." : "Add Mockup to Cart"}
          </button>

          <button
            type="button"
            onClick={downloadMockup}
            className="focus-ring mt-3 w-full border border-white/15 px-5 py-4 text-sm font-bold uppercase tracking-[0.22em] text-bone transition hover:border-white/30"
          >
            Download Mockup
          </button>
        </aside>

        <div className="grid gap-5 md:grid-cols-2">
          <MockupCard
            side="Front"
            shirtColor={shirtColor}
            product={selectedProduct}
            productImage={selectedImages[0]}
            designUrl=""
            designScale={designScale}
            designY={designY}
          />
          <MockupCard
            side="Back"
            shirtColor={shirtColor}
            product={selectedProduct}
            productImage={selectedImages[1] || selectedImages[0]}
            designUrl={designUrl}
            designScale={designScale}
            designY={designY}
          />
          {blendedImageUrl ? (
            <article className="border border-white/10 bg-graphite p-4 shadow-glow md:col-span-2 md:p-6">
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Back Mockup</p>
                <h2 className="mt-1 font-display text-2xl text-bone">Uploaded design on T-shirt</h2>
              </div>
              <div className="overflow-hidden bg-ink">
                <img src={blendedImageUrl} alt="Custom t-shirt back mockup with uploaded design" className="w-full object-contain" />
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Control({ label, value, min, max, onChange }) {
  return (
    <label className="mt-6 block text-sm text-zinc-400">
      <span className="flex items-center justify-between">
        {label}
        <span className="text-zinc-600">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-bone"
      />
    </label>
  );
}

function MockupCard({ side, shirtColor, product, productImage, designUrl, designScale, designY }) {
  return (
    <article className="border border-white/10 bg-graphite p-4 shadow-glow md:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{side}</p>
          <h2 className="mt-1 font-display text-2xl text-bone">{product?.name}</h2>
        </div>
      </div>

      <div className="relative aspect-[4/5] overflow-hidden bg-ink">
        {productImage ? (
          <img
            src={productImage}
            alt={`${product?.name || "Selected product"} ${side.toLowerCase()} preview`}
            className="absolute inset-0 h-full w-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShirtSvg fill={shirtColor.value} stroke={shirtColor.ink} />
          </div>
        )}

        {side === "Front" && !productImage ? (
          <div
            className="absolute left-1/2 top-[42%] w-44 -translate-x-1/2 text-center"
            style={{ color: shirtColor.ink }}
          >
            <p className="font-display text-3xl font-bold uppercase tracking-[0.12em]">EVOLVV</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em]">Wear the Change</p>
          </div>
        ) : side === "Back" && designUrl ? (
          <img
            src={designUrl}
            alt="Uploaded back design"
            className="absolute left-1/2 max-h-[34%] -translate-x-1/2 object-contain"
            style={{
              top: productImage ? `${Math.min(designY + 4, 74)}%` : `${designY}%`,
              width: productImage ? `${Math.max(designScale * 0.56, 18)}%` : `${designScale}%`,
              transform: "translate(-50%, -50%)"
            }}
          />
        ) : side === "Back" ? (
          <p className="absolute left-1/2 top-1/2 w-56 -translate-x-1/2 -translate-y-1/2 text-center text-sm text-zinc-500">
            Upload artwork to place it on the back.
          </p>
        ) : null}
      </div>
    </article>
  );
}

function getProductImages(product) {
  return (product?.images || [])
    .map((image) => (typeof image === "string" ? image : image?.url))
    .filter(Boolean);
}

function ShirtSvg({ fill, stroke }) {
  return (
    <svg viewBox="0 0 600 720" className="h-[88%] w-[88%]" aria-hidden="true">
      <path
        d="M218 72H382L513 172L448 282L405 246V628H195V246L152 282L87 172L218 72Z"
        fill={fill}
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="4"
      />
      <path d="M252 74C260 117 276 139 300 139C324 139 340 117 348 74" fill="none" stroke={stroke} strokeWidth="8" />
      <path d="M197 246V628H405V246" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="4" />
    </svg>
  );
}

async function createMockupDataUrl({ productName, shirtColor, designUrl, productImage, designScale, designY }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1500;
  const context = canvas.getContext("2d");

  context.fillStyle = "#050505";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#F6F4EF";
  context.textAlign = "center";
  context.font = "bold 46px Arial";
  context.fillText(productName, canvas.width / 2, 92);

  if (productImage) {
    const image = await loadImage(productImage);
    drawContainImage(context, image, 120, 170, 960, 1120);
  } else {
    drawShirt(context, 220, 190, shirtColor, false, 1.35);
  }

  if (designUrl) {
    const image = await removeFlatBackground(designUrl);
    const previewTop = productImage ? Math.min(designY + 4, 74) : designY;
    const previewWidth = productImage ? Math.max(designScale * 0.56, 18) : designScale;
    const maxWidth = productImage ? canvas.width * (previewWidth / 100) : 430 * (designScale / 100);
    const maxHeight = productImage ? canvas.height * 0.34 : 500 * (designScale / 100);
    const ratio = Math.min(maxWidth / image.width, maxHeight / image.height);
    const width = image.width * ratio;
    const height = image.height * ratio;
    const x = canvas.width / 2 - width / 2;
    const y = productImage
      ? canvas.height * (previewTop / 100) - height / 2
      : 555 + (designY - 50) * 4.2 - height / 2;

    context.save();
    context.globalAlpha = 0.98;
    context.drawImage(image, x, y, width, height);
    context.globalCompositeOperation = "multiply";
    context.globalAlpha = productImage ? 0.03 : shirtColor.name === "Bone" ? 0.08 : 0.2;
    context.fillStyle = shirtColor.value;
    context.fillRect(x, y, width, height);
    context.restore();
  }

  return canvas.toDataURL("image/png");
}

async function createAiReferenceImage({ productName, shirtColor, designUrl, productImage, designScale, designY }) {
  const fullMockup = await createMockupDataUrl({ productName, shirtColor, designUrl, productImage, designScale, designY });
  return resizeImageDataUrl(fullMockup, 512);
}

async function resizeImageDataUrl(dataUrl, maxSize) {
  const image = await loadImage(dataUrl);
  const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

async function removeFlatBackgroundDataUrl(dataUrl, maxSize) {
  const image = await removeFlatBackground(dataUrl);
  const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

async function compressImageDataUrl(dataUrl, maxSize) {
  const image = await loadImage(dataUrl);
  const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  context.fillStyle = "#050505";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function drawContainImage(context, image, x, y, width, height) {
  const ratio = Math.min(width / image.width, height / image.height);
  const drawWidth = image.width * ratio;
  const drawHeight = image.height * ratio;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

async function removeFlatBackground(dataUrl) {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const background = sampleCornerColor(data, canvas.width, canvas.height);
  const threshold = 28;
  let removed = 0;

  for (let index = 0; index < data.length; index += 4) {
    const distance = Math.hypot(
      data[index] - background.r,
      data[index + 1] - background.g,
      data[index + 2] - background.b
    );
    if (distance < threshold) {
      data[index + 3] = 0;
      removed += 1;
    } else if (distance < threshold * 1.8) {
      data[index + 3] = Math.round(data[index + 3] * ((distance - threshold) / (threshold * 0.8)));
    }
  }

  const removedRatio = removed / (data.length / 4);
  if (removedRatio > 0.82) {
    return image;
  }

  context.putImageData(imageData, 0, 0);
  return loadImage(canvas.toDataURL("image/png"));
}

function sampleCornerColor(data, width, height) {
  const points = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1]
  ];
  const total = points.reduce(
    (sum, [x, y]) => {
      const index = (y * width + x) * 4;
      return {
        r: sum.r + data[index],
        g: sum.g + data[index + 1],
        b: sum.b + data[index + 2]
      };
    },
    { r: 0, g: 0, b: 0 }
  );
  return {
    r: total.r / points.length,
    g: total.g / points.length,
    b: total.b / points.length
  };
}

function drawShirt(context, x, y, shirtColor, isFront, scale = 1) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.fillStyle = shirtColor.value;
  context.strokeStyle = "rgba(255,255,255,0.25)";
  context.lineWidth = 6;
  context.beginPath();
  context.moveTo(200, 0);
  context.lineTo(400, 0);
  context.lineTo(560, 120);
  context.lineTo(482, 255);
  context.lineTo(430, 212);
  context.lineTo(430, 640);
  context.lineTo(170, 640);
  context.lineTo(170, 212);
  context.lineTo(118, 255);
  context.lineTo(40, 120);
  context.closePath();
  context.fill();
  context.stroke();

  context.strokeStyle = shirtColor.ink;
  context.lineWidth = 9;
  context.beginPath();
  context.moveTo(242, 3);
  context.bezierCurveTo(255, 75, 275, 100, 300, 100);
  context.bezierCurveTo(325, 100, 345, 75, 358, 3);
  context.stroke();

  if (isFront) {
    context.fillStyle = shirtColor.ink;
    context.textAlign = "center";
    context.font = "bold 50px Arial";
    context.fillText("EVOLVV", 300, 275);
    context.font = "bold 18px Arial";
    context.fillText("WEAR THE CHANGE", 300, 315);
  }

  context.restore();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}
