import { NextResponse } from "next/server";

export const maxDuration = 120;

const allowedQualities = new Set(["low", "medium", "high"]);
const cloudflareImageModel = process.env.CLOUDFLARE_IMAGE_MODEL || "@cf/black-forest-labs/flux-1-schnell";
const cloudflareEditModel = process.env.CLOUDFLARE_EDIT_MODEL || "@cf/black-forest-labs/flux-2-klein-9b";

export async function POST(request) {
  try {
    const {
      mode = "generate",
      prompt,
      mockupImage,
      designImage,
      productName = "custom t-shirt",
      shirtColor = "selected",
      quality = "medium"
    } = await request.json();

    if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID) {
      return NextResponse.json(
        { error: "Add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID to .env.local to generate images." },
        { status: 400 }
      );
    }

    if (mode === "blend") {
      if (!mockupImage?.startsWith("data:image/")) {
        return NextResponse.json({ error: "Create a mockup before using AI blend." }, { status: 400 });
      }
      if (!designImage?.startsWith("data:image/")) {
        return NextResponse.json({ error: "Upload a design before using AI blend." }, { status: 400 });
      }

      return editWithCloudflare(
        [
          `Use image 1 as the base mockup: the back of a ${shirtColor} ${productName}.`,
          "Use image 2 as the customer artwork.",
          "Remove the artwork background completely, preserving only the actual design.",
          "Resize the artwork proportionally so it fits naturally inside the back print area.",
          "Blend it into the T-shirt as realistic screen print ink with subtle fabric texture, wrinkles, shadows, and shirt color interaction.",
          "Preserve the artwork content and colors as much as possible.",
          "Keep the result as a clean ecommerce back-of-shirt mockup. Do not add extra text, logos, people, hands, hangers, watermarks, or a new design."
        ].join(" "),
        [mockupImage, designImage],
        quality
      );
    }

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Enter a prompt before generating." }, { status: 400 });
    }

    return generateWithCloudflare(prompt.trim(), quality);
  } catch (error) {
    return NextResponse.json({ error: error.message || "Image generation failed." }, { status: 500 });
  }
}

async function editWithCloudflare(prompt, images, quality = "medium") {
  const formData = new FormData();
  formData.append("prompt", prompt);
  formData.append("width", "1024");
  formData.append("height", "1536");
  formData.append("guidance", quality === "high" ? "4.5" : quality === "low" ? "2.5" : "3.5");

  images.forEach((image, index) => {
    formData.append(`input_image_${index}`, dataUrlToBlob(image), `input-${index}.png`);
  });

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${cloudflareEditModel}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`
      },
      body: formData
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    const message = data.errors?.[0]?.message || data.error || "Cloudflare image editing failed.";
    return NextResponse.json({ error: message }, { status: response.status });
  }

  const imageUrl = await normalizeImageResult(data.result?.image);
  if (!imageUrl) return NextResponse.json({ error: "No edited image was returned." }, { status: 500 });

  return NextResponse.json({ imageUrl });
}

async function generateWithCloudflare(prompt, quality = "medium") {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${cloudflareImageModel}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        steps: qualityToSteps(quality)
      })
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    const message = data.errors?.[0]?.message || data.error || "Cloudflare image generation failed.";
    return NextResponse.json({ error: message }, { status: response.status });
  }

  const image = data.result?.image;
  if (!image) return NextResponse.json({ error: "No image was returned." }, { status: 500 });

  const imageUrl = await normalizeImageResult(image);
  return NextResponse.json({ imageUrl });
}

async function normalizeImageResult(image) {
  if (!image) return "";
  if (image.startsWith("data:image/")) return image;
  if (image.startsWith("http://") || image.startsWith("https://")) {
    const response = await fetch(image);
    if (!response.ok) return image;
    const contentType = response.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await response.arrayBuffer());
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  }
  return `data:image/jpeg;base64,${image}`;
}

function qualityToSteps(quality) {
  if (!allowedQualities.has(quality)) return 6;
  if (quality === "low") return 4;
  if (quality === "high") return 8;
  return 6;
}

function dataUrlToBlob(dataUrl) {
  const [header, base64Data] = dataUrl.split(",");
  const mime = header.match(/data:(.*);base64/)?.[1] || "image/png";
  const bytes = Buffer.from(base64Data, "base64");
  return new Blob([bytes], { type: mime });
}
