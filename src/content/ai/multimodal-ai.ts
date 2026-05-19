export const content = {
  title: "Multimodal AI",
  sections: [
    {
      heading: "What is Multimodal AI?",
      body: `**Multimodal AI** models can process multiple types of input: text, images, audio, video, and documents. Modern LLMs like Claude 3.5, GPT-4o, and Gemini 1.5 accept images alongside text in the same conversation. This enables a new class of features — understanding screenshots, extracting data from PDFs, analysing charts, or describing UI errors from a screenshot.`,
    },
    {
      heading: "Sending Images to Claude",
      body: `Images can be sent as **base64-encoded data** or as a **URL**. Base64 works everywhere; URLs require the model to fetch the image. For production, prefer base64 to avoid latency and privacy leaks from external URLs.`,
      code: `import anthropic, base64, httpx

client = anthropic.Anthropic()

# Option 1: base64 from file
def describe_image_file(path: str) -> str:
    with open(path, "rb") as f:
        data = base64.standard_b64encode(f.read()).decode()

    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {"type": "base64", "media_type": "image/png", "data": data},
                    },
                    {"type": "text", "text": "Describe what you see in this image."},
                ],
            }
        ],
    )
    return msg.content[0].text

# Option 2: base64 from URL
def describe_image_url(url: str) -> str:
    resp    = httpx.get(url)
    data    = base64.standard_b64encode(resp.content).decode()
    # Infer media type from response headers
    mt      = resp.headers.get("content-type", "image/jpeg").split(";")[0]

    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": mt, "data": data}},
                {"type": "text", "text": "What does this image show?"},
            ],
        }],
    )
    return msg.content[0].text`,
    },
    {
      heading: "Document Understanding",
      body: `Claude can process PDFs directly — pass a PDF as a base64 document. This is superior to extracting text first because Claude can see the layout, tables, and visual structure. Useful for invoices, contracts, forms, research papers.`,
      code: `import anthropic, base64

client = anthropic.Anthropic()

def extract_from_pdf(pdf_path: str, instruction: str) -> str:
    with open(pdf_path, "rb") as f:
        pdf_data = base64.standard_b64encode(f.read()).decode()

    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "document",
                        "source": {
                            "type": "base64",
                            "media_type": "application/pdf",
                            "data": pdf_data,
                        },
                    },
                    {"type": "text", "text": instruction},
                ],
            }
        ],
    )
    return msg.content[0].text

# Examples
result = extract_from_pdf("invoice.pdf",
    "Extract: invoice number, date, vendor name, line items, total. Return JSON.")
result = extract_from_pdf("contract.pdf",
    "Identify any clauses related to termination or liability. Quote the exact text.")`,
    },
    {
      heading: "Multiple Images in One Request",
      body: `You can send multiple images in a single request. Claude maintains context across all of them — useful for comparing images, analysing a sequence of screenshots, or reviewing multiple diagrams.`,
      code: `import anthropic, base64

client = anthropic.Anthropic()

def compare_images(image_paths: list[str], question: str) -> str:
    content = []

    for i, path in enumerate(image_paths):
        with open(path, "rb") as f:
            data = base64.standard_b64encode(f.read()).decode()

        content.append({
            "type": "image",
            "source": {"type": "base64", "media_type": "image/png", "data": data},
        })
        content.append({"type": "text", "text": f"Image {i + 1}:"})

    content.append({"type": "text", "text": question})

    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": content}],
    )
    return msg.content[0].text

# Example: compare two UI screenshots
answer = compare_images(
    ["before.png", "after.png"],
    "What changed between the before and after screenshots? List the differences."
)`,
    },
    {
      heading: "Multimodal Use Cases in Production",
      body: `Practical use cases that are feasible with current multimodal APIs.`,
      items: [
        "**Invoice & receipt extraction** — OCR + structured extraction in one call, no separate OCR service needed",
        "**Screenshot debugging** — user uploads a screenshot of an error; AI diagnoses the problem",
        "**Chart & graph analysis** — extract data points, trends, and insights from business charts",
        "**UI testing** — take screenshots of UI states and verify they match expected layouts",
        "**Content moderation** — flag inappropriate images in user-generated content",
        "**Product image tagging** — auto-tag product images with categories, attributes, and descriptions",
        "**Document classification** — classify uploaded forms, letters, or contracts by type",
      ],
    },
    {
      heading: "Image Sizing and Cost",
      body: `Image cost depends on the resolution. Claude charges based on tokens, and images consume tokens based on their pixel dimensions. Large images cost more — resize them before sending if full resolution isn't needed.`,
      code: `from PIL import Image
import io, base64

def resize_for_llm(image_bytes: bytes, max_dim: int = 1568) -> tuple[bytes, str]:
    """Resize image so longest edge <= max_dim. Returns bytes and media type."""
    img = Image.open(io.BytesIO(image_bytes))
    img.thumbnail((max_dim, max_dim), Image.LANCZOS)

    buf = io.BytesIO()
    fmt = img.format or "PNG"
    img.save(buf, format=fmt)
    return buf.getvalue(), f"image/{fmt.lower()}"

# Token cost guideline (Claude):
# 1092×1092 image ≈ 1334 tokens ≈ $0.004 at Sonnet pricing
# Resize to 500×500 → ≈ 400 tokens  (3× cheaper)
# For document extraction: 1568px long edge is fine
# For thumbnail classification: 500px is enough`,
    },
  ],
};
