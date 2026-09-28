from pathlib import Path

from PIL import Image, ImageChops, ImageStat


ROOT = Path(r"C:\Users\Administrator\Desktop\茶叶")
PROJECT = ROOT / "分销茶叶商城"
RAW = ROOT / "docs" / "login45-special"
OUT = PROJECT / "docs" / "login45-special"
DESIGN = ROOT / "设计稿拆分" / "单页设计稿" / "45-登录注册.png"


def simulator_content(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGB")
    return image.crop((921, 91, 1250, 347))


def simulator_nav(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGB")
    return image.crop((921, 347, 1250, 419))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    top = simulator_content(RAW / "07-final-mp-top-raw.png")
    card = simulator_content(RAW / "08-final-mp-card-raw.png")
    member = simulator_content(RAW / "09-final-mp-member-raw.png")
    end = simulator_content(RAW / "10-final-mp-end-raw.png")
    nav = simulator_nav(RAW / "10-final-mp-end-raw.png")

    # 微信开发者工具当前设备预设是横向折叠屏，工具不提供整页截图。
    # 下面按实际滚动采样位置拼接；保留原始分段截图用于追溯。
    composite = Image.new("RGB", (329, 1094), "white")
    composite.paste(top, (0, 0))
    composite.paste(card, (0, 245))
    composite.paste(member, (0, 501))
    composite.paste(end, (0, 757))
    composite.paste(nav, (0, 1022))
    composite_448 = composite.resize((448, 1489), Image.Resampling.LANCZOS)
    composite_path = OUT / "45-login-mp-448x1489-scroll-composite.png"
    composite_448.save(composite_path, optimize=True)

    design = Image.open(DESIGN).convert("RGB")
    if design.size != (448, 1489):
        raise RuntimeError(f"设计稿尺寸异常: {design.size}")

    side = Image.new("RGB", (916, 1489), "#ece9e1")
    side.paste(design, (0, 0))
    side.paste(composite_448, (468, 0))
    side_path = OUT / "45-login-design-vs-mp.png"
    side.save(side_path, optimize=True)

    overlay = Image.blend(design, composite_448, 0.5)
    overlay_path = OUT / "45-login-overlay-50.png"
    overlay.save(overlay_path, optimize=True)

    difference = ImageChops.difference(design, composite_448)
    stat = ImageStat.Stat(difference)
    mae = sum(stat.mean) / 3
    rms = sum(stat.rms) / 3
    metrics = OUT / "45-login-visual-metrics.txt"
    metrics.write_text(
        "\n".join(
            [
                "基准=448x1489",
                "运行图=微信开发者工具滚动分段拼接（原始分段保留）",
                f"RGB平均绝对差={mae:.4f}",
                f"RGB均方根差={rms:.4f}",
                "说明=像素差受页面真实素材与静态设计稿素材差异、滚动拼接影响，不能单独作为1:1通过判定。",
            ]
        ),
        encoding="utf-8",
    )

    print(composite_path)
    print(side_path)
    print(overlay_path)
    print(metrics)


if __name__ == "__main__":
    main()
