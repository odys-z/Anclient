import re
import sys
from pathlib import Path

def scale_svg_coordinates(svg_content: str, target_size: float = 32.0, original_size: float = 512.0) -> str:
    scale = target_size / original_size

    def scale_number(match):
        try:
            num = float(match.group(0))
            return f"{num * scale:.4f}"
        except ValueError:
            return match.group(0)

    # Scale viewBox
    svg_content = re.sub(
        r'viewBox="0 0 512 512"',
        f'viewBox="0 0 {target_size} {target_size}"',
        svg_content
    )

    # Scale all numbers inside d="..." attributes (handles multiline paths)
    def scale_path_d(match):
        d_attr = match.group(2)
        scaled_d = re.sub(r"[-+]?\d*\.?\d+", scale_number, d_attr)
        return match.group(1) + scaled_d + match.group(3)

    svg_content = re.sub(
        r'(d=")([\s\S]*?)(")',
        scale_path_d,
        svg_content
    )

    # Scale transform values (e.g. translate(61,111) -> translate(3.81,6.94))
    def scale_transform(match):
        values = match.group(1)
        scaled_values = re.sub(r"[-+]?\d*\.?\d+", scale_number, values)
        return f"translate({scaled_values})"

    svg_content = re.sub(
        r'translate\(([^)]+)\)',
        scale_transform,
        svg_content
    )

    return svg_content


def main():
    if len(sys.argv) < 2:
        print("Usage: python scale_svg.py <input.svg> [output.svg]")
        sys.exit(1)

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else input_path.with_name(input_path.stem + "_32x32" + input_path.suffix)

    with open(input_path, "r", encoding="utf-8") as f:
        content = f.read()

    scaled_content = scale_svg_coordinates(content)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(scaled_content)

    print(f"✅ Scaled SVG saved to: {output_path}")


if __name__ == "__main__":
    main()