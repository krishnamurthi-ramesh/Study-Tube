"""
Create 1280x800 store listing screenshots from real user captures.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

def build_screenshot_1(img5_path, out_path):
    # Canvas: 1280 x 800
    canvas = Image.new('RGB', (1280, 800), color=(15, 23, 42)) # Slate 900
    draw = ImageDraw.Draw(canvas)

    # Top gradient line
    for x in range(1280):
        ratio = x / 1280
        r = int(14 + (99 - 14) * ratio)
        g = int(165 + (102 - 165) * ratio)
        b = int(233 + (241 - 233) * ratio)
        draw.line([(x, 0), (x, 4)], fill=(r, g, b))

    # Header text
    # Badge
    draw.rounded_rectangle([50, 24, 280, 54], radius=6, fill=(30, 41, 59), outline=(56, 189, 248), width=1)
    draw.text((68, 32), "STUDYTUBE LIVE IN ACTION", fill=(56, 189, 248))

    draw.text((300, 26), "Real-Time Bandwidth Conserved & Audio-First Mode", fill=(255, 255, 255))
    draw.text((300, 48), "Active DASH socket telemetry tracking wire MB saved on YouTube in real time", fill=(148, 163, 184))

    # Load image 5 (1024x536)
    src = Image.open(img5_path)
    # Target size: scale proportionally to fit width ~1180, height ~670
    scale = 1180 / src.width
    new_w = int(src.width * scale)
    new_h = int(src.height * scale)
    if new_h > 690:
        scale = 690 / src.height
        new_w = int(src.width * scale)
        new_h = int(src.height * scale)
    resized = src.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Center horizontally and vertically in available space (y: 80 to 780)
    pos_x = (1280 - new_w) // 2
    pos_y = 80 + (700 - new_h) // 2

    # Drop shadow
    shadow = Image.new('RGBA', (new_w + 20, new_h + 20), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle([10, 10, new_w + 10, new_h + 10], radius=14, fill=(0, 0, 0, 160))
    shadow = shadow.filter(ImageFilter.GaussianBlur(8))
    canvas.paste(shadow, (pos_x - 10, pos_y - 10), shadow)

    # Paste screenshot
    canvas.paste(resized, (pos_x, pos_y))
    # Border
    draw.rounded_rectangle([pos_x, pos_y, pos_x + new_w, pos_y + new_h], radius=10, outline=(71, 85, 105), width=2)

    canvas.save(out_path, format="PNG")
    print(f"Saved Screenshot 1: {out_path}")

def build_screenshot_2(img3_path, out_path):
    canvas = Image.new('RGB', (1280, 800), color=(15, 23, 42))
    draw = ImageDraw.Draw(canvas)

    for x in range(1280):
        ratio = x / 1280
        r = int(59 + (16 - 59) * ratio)
        g = int(130 + (185 - 130) * ratio)
        b = int(246 + (129 - 246) * ratio)
        draw.line([(x, 0), (x, 4)], fill=(r, g, b))

    draw.rounded_rectangle([50, 24, 290, 54], radius=6, fill=(30, 41, 59), outline=(52, 211, 153), width=1)
    draw.text((68, 32), "STREAM TELEMETRY RECEIPT", fill=(52, 211, 153))

    draw.text((310, 26), "Glass-Box AI Advice & Instant Session Savings Recap", fill=(255, 255, 255))
    draw.text((310, 48), "Categorizes stream, locks optimal resolution, and calculates cellular plan impact", fill=(148, 163, 184))

    src = Image.open(img3_path)
    scale = 1180 / src.width
    new_w = int(src.width * scale)
    new_h = int(src.height * scale)
    if new_h > 690:
        scale = 690 / src.height
        new_w = int(src.width * scale)
        new_h = int(src.height * scale)
    resized = src.resize((new_w, new_h), Image.Resampling.LANCZOS)

    pos_x = (1280 - new_w) // 2
    pos_y = 80 + (700 - new_h) // 2

    shadow = Image.new('RGBA', (new_w + 20, new_h + 20), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle([10, 10, new_w + 10, new_h + 10], radius=14, fill=(0, 0, 0, 160))
    shadow = shadow.filter(ImageFilter.GaussianBlur(8))
    canvas.paste(shadow, (pos_x - 10, pos_y - 10), shadow)

    canvas.paste(resized, (pos_x, pos_y))
    draw.rounded_rectangle([pos_x, pos_y, pos_x + new_w, pos_y + new_h], radius=10, outline=(71, 85, 105), width=2)

    canvas.save(out_path, format="PNG")
    print(f"Saved Screenshot 2: {out_path}")

def build_screenshot_3(img1_path, img4_path, out_path):
    canvas = Image.new('RGB', (1280, 800), color=(15, 23, 42))
    draw = ImageDraw.Draw(canvas)

    for x in range(1280):
        ratio = x / 1280
        r = int(147 + (236 - 147) * ratio)
        g = int(51 + (72 - 51) * ratio)
        b = int(234 + (153 - 234) * ratio)
        draw.line([(x, 0), (x, 4)], fill=(r, g, b))

    draw.rounded_rectangle([50, 24, 280, 54], radius=6, fill=(30, 41, 59), outline=(192, 132, 252), width=1)
    draw.text((68, 32), "CONTROLS & QUOTA TARGETS", fill=(192, 132, 252))

    draw.text((300, 26), "Custom Data Plans, Distraction Shields & Feedback Loop", fill=(255, 255, 255))
    draw.text((300, 48), "Set 1.0GB - 3.0GB daily targets, block comments, and suggest features directly", fill=(148, 163, 184))

    # Two side-by-side popup cards
    src1 = Image.open(img1_path).convert('RGB')
    src2 = Image.open(img4_path).convert('RGB')

    # Scale them to height ~660
    target_h = 660
    scale1 = target_h / src1.height
    w1 = int(src1.width * scale1)
    res1 = src1.resize((w1, target_h), Image.Resampling.LANCZOS)

    scale2 = target_h / src2.height
    w2 = int(src2.width * scale2)
    res2 = src2.resize((w2, target_h), Image.Resampling.LANCZOS)

    total_w = w1 + 60 + w2
    start_x = (1280 - total_w) // 2
    pos_y = 95

    # Card 1
    canvas.paste(res1, (start_x, pos_y))
    draw.rounded_rectangle([start_x, pos_y, start_x + w1, pos_y + target_h], radius=10, outline=(71, 85, 105), width=2)

    # Card 2
    canvas.paste(res2, (start_x + w1 + 60, pos_y))
    draw.rounded_rectangle([start_x + w1 + 60, pos_y, start_x + w1 + 60 + w2, pos_y + target_h], radius=10, outline=(71, 85, 105), width=2)

    canvas.save(out_path, format="PNG")
    print(f"Saved Screenshot 3: {out_path}")

if __name__ == "__main__":
    base_user = r"C:/Users/KRISHNA MURTHI/.gemini/antigravity/brain/93fa904e-70b6-43d6-ba6e-ee0c6a167ac2/.user_uploaded"
    img1 = os.path.join(base_user, "media_1793902216985_4fe57355.jpg")
    img3 = os.path.join(base_user, "media_1793902217038_61b93e00.jpg")
    img4 = os.path.join(base_user, "media_1793902217006_b8841ec4.png")
    img5 = os.path.join(base_user, "media_1793902217040_21e4161f.jpg")

    out_dir = r"E:\StudyTube\store_assets"
    build_screenshot_1(img5, os.path.join(out_dir, "screenshot1_audio_first_1280x800.png"))
    build_screenshot_2(img3, os.path.join(out_dir, "screenshot2_stream_receipt_1280x800.png"))
    build_screenshot_3(img1, img4, os.path.join(out_dir, "screenshot3_controls_quota_1280x800.png"))
