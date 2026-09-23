"""Render the GEPA article's Qwen3 8B comparison from Agrawal et al., Table 1.

Source: https://arxiv.org/html/2507.19457#S4.T1
Run: py -3 scripts/gepa_results_chart.py
"""

from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.ticker import FuncFormatter

ROOT = Path(__file__).resolve().parents[1]
TASKS = ["HotpotQA", "IFBench", "HoVer", "PUPA", "AIME-2025", "LiveBench–Math"]
GRPO = np.array([43.33, 35.88, 38.67, 86.66, 38.00, 51.26])
GEPA = np.array([62.33, 38.61, 52.33, 91.85, 32.00, 51.95])
CHANGE = np.round(GEPA - GRPO, 2)

PAPER = "#0e120f"
INK = "#edf2ea"
MUTED = "#b2bcb0"
GRID = "#344036"
ACCENT = "#c6ff00"


def render(mobile: bool) -> None:
    plt.rcParams.update({
        "font.family": "DejaVu Sans",
        "axes.unicode_minus": False,
        "savefig.facecolor": PAPER,
    })
    if mobile:
        size, bounds, title_size, task_size, number_size = (
            (4.8, 8.3), [0.36, 0.225, 0.54, 0.565], 19, 16, 15
        )
        heading, note = (0.075, 0.94), (0.075, 0.125)
        filename = "gepa-qwen-results-mobile.png"
    else:
        size, bounds, title_size, task_size, number_size = (
            (10, 6.6), [0.265, 0.245, 0.66, 0.555], 24, 16, 15
        )
        heading, note = (0.075, 0.94), (0.075, 0.12)
        filename = "gepa-qwen-results.png"

    fig = plt.figure(figsize=size, facecolor=PAPER)
    ax = fig.add_axes(bounds, facecolor=PAPER)
    y = np.arange(len(TASKS))
    ax.set_axisbelow(True)
    ax.grid(axis="x", color=GRID, linewidth=0.85)
    ax.axvline(0, color=MUTED, linewidth=1.25, zorder=2)
    ax.barh(y, CHANGE, height=0.43 if mobile else 0.38,
            color=[ACCENT if delta >= 0 else INK for delta in CHANGE],
            edgecolor="none", zorder=3)

    for row, delta in enumerate(CHANGE):
        sign = "+" if delta > 0 else "−"
        inside = mobile and delta > 15
        ax.text(delta - 0.5 if inside else delta + 0.45 if delta > 0 else 1, row,
                f"{sign}{abs(delta):.2f}",
                ha="right" if inside else "left", va="center",
                color=PAPER if inside else ACCENT if delta > 0 else INK,
                fontsize=number_size, fontweight="bold")

    ax.set_yticks(y, TASKS[:-1] + (["LiveBench\nMath"] if mobile else [TASKS[-1]]),
                  color=INK, fontsize=task_size)
    ax.tick_params(axis="y", length=0, pad=15 if mobile else 18)
    ax.invert_yaxis()
    ax.set_xlim(-9, 24)
    ax.set_xticks([-5, 0, 5, 10, 15, 20])
    ax.xaxis.set_major_formatter(FuncFormatter(lambda value, _: f"{value:+.0f}" if value else "0"))
    ax.tick_params(axis="x", colors=MUTED, labelsize=12, length=0, pad=10)
    ax.set_xlabel("GEPA − GRPO  ·  percentage points", color=MUTED,
                  fontsize=12 if mobile else 13, labelpad=17)
    for spine in ax.spines.values():
        spine.set_visible(False)

    fig.text(*heading, "GEPA vs GRPO" if mobile else "Where GEPA gains — and loses", color=INK,
             fontsize=title_size, weight="bold", ha="left", va="top")
    fig.text(heading[0], heading[1] - (0.052 if mobile else 0.074),
             "Qwen3 8B  /  six held-out task scores", color=MUTED,
             fontsize=12 if mobile else 13, ha="left", va="top")
    fig.text(*note, "Five tasks favor GEPA; AIME-2025 favors GRPO.",
             color=INK, fontsize=11 if mobile else 12, ha="left", va="top")
    fig.text(note[0], 0.056, "Source: Agrawal et al., GEPA, Table 1  ·  test-set scores",
             color=MUTED, fontsize=10, ha="left", va="top")
    fig.savefig(ROOT / "public" / filename, dpi=180, facecolor=PAPER)
    plt.close(fig)


if __name__ == "__main__":
    render(False)
    render(True)
