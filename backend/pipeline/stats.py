"""
Statistical processing layer.
Computes all numeric features from the raw dataset that the narrative layer needs.
"""

from typing import List, Dict, Any
from scipy.stats import iqr
from scipy import stats as scipy_stats
import base64
import io
from matplotlib.backends.backend_agg import FigureCanvasAgg
from matplotlib.figure import Figure
import numpy as np
import matplotlib

matplotlib.use("Agg")  # Explicitly use non-interactive Agg backend


def compute_stats(data: List[Dict], tier: str) -> Dict[str, Any]:
    """
    Given a list of {x, label, y, y2?} dicts, produce a rich statistical profile.
    """
    xs = np.array([d["x"] for d in data])
    ys = np.array([d["y"] for d in data])
    labels = [d["label"] for d in data]

    mean_y = float(np.mean(ys))
    median_y = float(np.median(ys))
    std_y = float(np.std(ys, ddof=1)) if len(ys) > 1 else 0.0
    iqr_y = float(iqr(ys))
    q1 = float(np.percentile(ys, 25))
    q3 = float(np.percentile(ys, 75))

    # Linear trend using scipy (OLS)
    slope, intercept, r_value, p_value, std_err = scipy_stats.linregress(xs, ys)

    _, _, r_value, p_value, std_err = scipy_stats.linregress(xs, ys)

    # Outlier detection
    lower_fence = q1 - 1.5 * iqr_y
    upper_fence = q3 + 1.5 * iqr_y

    # Annotate each point
    points = []
    for i, d in enumerate(data):
        y = ys[i]
        is_outlier = bool(y < lower_fence or y > upper_fence)
        distance_from_mean = float(y - mean_y)
        role = _assign_point_role(y, mean_y, std_y, is_outlier, distance_from_mean)
        points.append(
            {
                "index": i,
                "x": float(xs[i]),
                "y": float(y),
                "y2": d.get("y2"),  # Propagate secondary value
                "label": labels[i],
                "role": role,
                "is_outlier": is_outlier,
                "distance_from_mean": distance_from_mean,
                "z_score": float((y - mean_y) / std_y) if std_y > 0 else 0.0,
            }
        )

    trend_direction = _classify_trend(slope, ys)

    diffs = np.abs(np.diff(ys))
    max_change_idx = int(np.argmax(diffs)) if len(diffs) > 0 else 0

    result = {
        "summary": {
            "mean": round(mean_y, 3),
            "median": round(median_y, 3),
            "std": round(std_y, 3),
            "iqr": round(iqr_y, 3),
            "q1": round(q1, 3),
            "q3": round(q3, 3),
            "min": round(float(np.min(ys)), 3),
            "max": round(float(np.max(ys)), 3),
            "range": round(float(np.max(ys) - np.min(ys)), 3),
            "n": len(data),
            "lower_fence": round(lower_fence, 3),
            "upper_fence": round(upper_fence, 3),
        },
        "trend": {
            "slope": round(float(slope), 6),
            "intercept": round(float(intercept), 3),
            "r_squared": round(float(r_value**2), 4),
            "direction": trend_direction,
            "p_value": round(float(p_value), 4),
        },
        "points": points,
        "max_change_index": max_change_idx,
        "outlier_count": sum(1 for p in points if p["is_outlier"]),
    }

    if tier == "R":
        result["confidence_bands"] = _compute_ci_bands(xs, ys, intercept, slope)
        result["effect_size"] = _compute_cohens_d(ys)

    return result


def _assign_point_role(y, mean, std, is_outlier, distance):
    if is_outlier:
        return "Outlier"
    if abs(distance) < std * 0.3:
        return "Mean"
    if distance > std * 0.8:
        return "Peak"
    if distance < -std * 0.8:
        return "Trough"
    return "Trend"


def _classify_trend(slope, ys):
    n = len(ys)
    if n < 2:
        return "flat"

    early = np.mean(ys[: max(1, n // 3)])
    late = np.mean(ys[-(n // 3):]) if n > 2 else ys[-1]
    total_range = np.max(ys) - np.min(ys)

    if total_range < 1e-9:
        return "flat"

    rel_slope = (late - early) / total_range

    mid = n // 2
    s1, *_ = (
        scipy_stats.linregress(range(mid), ys[:mid])
        if mid > 1
        else (slope,) + (None,) * 4
    )
    s2, *_ = (
        scipy_stats.linregress(range(n - mid), ys[mid:])
        if (n - mid) > 1
        else (slope,) + (None,) * 4
    )

    if (
        s1 is not None
        and s2 is not None
        and s1 * s2 < 0
        and abs(s1 - s2) > abs(slope) * 0.5
    ):
        return "reversal"

    if rel_slope > 0.25:
        return "rise"
    if rel_slope < -0.25:
        return "fall"

    if n >= 3:
        penultimate_trend = np.mean(np.diff(ys[:-1]))
        last_change = ys[-1] - ys[-2]
        if (
            abs(last_change) > 2 * abs(penultimate_trend)
            and abs(penultimate_trend) > 1e-9
        ):
            return "cliffhanger"

    return "plateau"


def _compute_ci_bands(xs, ys, intercept, slope):
    n = len(xs)
    x_mean = np.mean(xs)
    se = np.std(ys - (slope * xs + intercept), ddof=2) if n > 2 else 0
    t_crit = scipy_stats.t.ppf(0.975, df=max(1, n - 2))
    bands = []
    for x in xs:
        y_hat = slope * x + intercept
        leverage = np.sqrt(
            1 / n + (x - x_mean) ** 2 / (np.sum((xs - x_mean) ** 2) + 1e-12)
        )
        margin = float(t_crit * se * leverage)
        bands.append(
            {
                "x": float(x),
                "y_hat": round(float(y_hat), 3),
                "lower": round(float(y_hat - margin), 3),
                "upper": round(float(y_hat + margin), 3),
            }
        )
    return bands


def _compute_cohens_d(ys):
    n = len(ys)
    half = n // 2
    if half < 2:
        return 0.0
    g1 = ys[:half]
    g2 = ys[half:]
    pooled_std = np.sqrt((np.std(g1, ddof=1) ** 2 + np.std(g2, ddof=1) ** 2) / 2)
    if pooled_std < 1e-9:
        return 0.0
    return round(float((np.mean(g2) - np.mean(g1)) / pooled_std), 3)


def render_stats_chart_base64(
    xs, ys, slope, intercept, current_idx, title, unit, ys2=None
) -> str:
    """
    Renders a high-quality, large-scale chart using isolated Figure objects for thread-safety.
    Supports an optional second series (ys2) for comparative analysis.
    """
    fig = Figure(figsize=(12, 8), dpi=120)
    ax = fig.add_subplot(111)

    # Plot context line (light grey background)
    ax.plot(
        xs,
        ys,
        color="#eeeeee",
        linestyle="-",
        linewidth=2,
        label="Primary series",
        zorder=-1,
    )

    # Plot optional secondary series (dashed green)
    if ys2 is not None and len(ys2) > 0:
        ax.plot(
            xs,
            ys2,
            color="#34D399",
            linestyle="--",
            linewidth=2,
            label="Secondary series (Correlated)",
            alpha=0.6,
        )
        # Highlight current observation point for secondary
        if current_idx < len(ys2):
            ax.scatter(
                xs[current_idx],
                ys2[current_idx],
                color="#10B981",
                s=100,
                zorder=9,
                alpha=0.8,
            )

    # Plot PyTorch Regression fit (Clear Straight Line)
    trend_y = slope * xs + intercept
    ax.plot(
        xs,
        trend_y,
        color="#0066cc",
        linestyle=":",
        linewidth=1.5,
        alpha=0.3,
        label="Primary Trend fit",
    )

    # Plot progress so far (Bold, clear focus)
    ax.plot(
        xs[: current_idx + 1],
        ys[: current_idx + 1],
        color="#1a1a1a",
        linewidth=4,
        label="Primary trajectory",
    )

    # Highlight current observation point
    ax.scatter(
        xs[current_idx],
        ys[current_idx],
        color="#EF4444",
        s=250,
        zorder=10,
        edgecolor="white",
        linewidth=2,
    )

    ax.set_title(f"DATASET ANALYSIS: {title}", fontsize=18, fontweight="bold", pad=25)
    ax.set_xlabel("Timeline Index", fontsize=14, labelpad=10)
    ax.set_ylabel(unit if unit else "Observation Intensity", fontsize=14, labelpad=10)

    # Clean up aesthetics
    ax.grid(True, which="both", linestyle="--", alpha=0.3)
    ax.legend(loc="upper right", frameon=True, fontsize=12)

    # Ensure axes are stable across panels
    val_min = min(ys)
    val_max = max(ys)
    if ys2 is not None and len(ys2) > 0:
        val_min = min(val_min, min(ys2))
        val_max = max(val_max, max(ys2))

    ax.set_ylim(val_min * 0.85, val_max * 1.15)

    # Use FigureCanvasAgg for systematic rendering
    canvas = FigureCanvasAgg(fig)
    buf = io.BytesIO()
    canvas.print_png(buf)

    buf.seek(0)
    return "data:image/png;base64," + base64.b64encode(buf.read()).decode("utf-8")
