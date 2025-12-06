# lr_logic.py

from typing import Any, Dict, List, Optional


def _to_float(value: Any, default: Optional[float] = None) -> Optional[float]:
    try:
        if value is None:
            return default
        return float(value)
    except (ValueError, TypeError):
        return default


def _to_int(value: Any, default: Optional[int] = None) -> Optional[int]:
    try:
        if value is None or value == "":
            return default
        return int(float(value))
    except (ValueError, TypeError):
        return default


def _to_str(value: Any, default: str = "") -> str:
    if value is None:
        return default
    s = str(value).strip()
    return s if s else default


def _normalize_record(raw: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize a single video performance record into consistent types.
    """
    video_id = _to_str(raw.get("video_id", ""))

    duration_sec = _to_float(raw.get("duration_sec"), None)
    if duration_sec is not None and duration_sec < 0:
        duration_sec = None

    hook_strength_score = _to_float(raw.get("hook_strength_score"), None)
    if hook_strength_score is not None:
        # Clamp to 0–1 range if needed
        if hook_strength_score < 0:
            hook_strength_score = 0.0
        elif hook_strength_score > 1:
            hook_strength_score = 1.0

    niche = _to_str(raw.get("niche", "Unknown")) or "Unknown"

    views_first_hour = _to_int(raw.get("views_first_hour"), None)
    if views_first_hour is not None and views_first_hour < 0:
        views_first_hour = None

    views_total = _to_int(raw.get("views_total"), None)
    if views_total is not None and views_total < 0:
        views_total = None

    retention_rate = _to_float(raw.get("retention_rate"), None)
    if retention_rate is not None:
        # Expected 0–1 scale
        if retention_rate < 0:
            retention_rate = 0.0
        elif retention_rate > 1:
            retention_rate = 1.0

    first_3_sec_engagement = _to_float(raw.get("first_3_sec_engagement"), None)
    if first_3_sec_engagement is not None:
        if first_3_sec_engagement < 0:
            first_3_sec_engagement = 0.0
        elif first_3_sec_engagement > 1:
            first_3_sec_engagement = 1.0

    music_type = _to_str(raw.get("music_type", "Unknown")) or "Unknown"

    upload_time = _to_str(raw.get("upload_time", ""))

    return {
        "video_id": video_id,
        "duration_sec": duration_sec,
        "hook_strength_score": hook_strength_score,
        "niche": niche,
        "views_first_hour": views_first_hour,
        "views_total": views_total,
        "retention_rate": retention_rate,
        "first_3_sec_engagement": first_3_sec_engagement,
        "music_type": music_type,
        "upload_time": upload_time,
    }


def analyze(data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Main analysis function for the 'Viral Shorts & Reels Performance Analyzer' scenario.

    data: list of dictionaries representing video performance records.
    Each dict is expected to contain:
        - video_id (str)
        - duration_sec (int/float)
        - hook_strength_score (float, 0–1)
        - niche (str)
        - views_first_hour (int)
        - views_total (int)
        - retention_rate (float, 0–1)
        - first_3_sec_engagement (float, 0–1)
        - music_type (str)
        - upload_time (str, YYYY-MM-DD)
    """
    accounts: List[Dict[str, Any]] = []

    total_videos = 0

    # For Average Retention Rate (%)
    sum_retention_pct = 0.0
    count_retention = 0

    # For Viral Hit Percentage (%)
    viral_count = 0

    # For Average First-Hour Views
    sum_views_first_hour = 0.0
    count_views_first_hour = 0

    for raw in data:
        record = _normalize_record(raw)
        accounts.append(record)
        total_videos += 1

        retention_rate = record.get("retention_rate")
        if retention_rate is not None:
            sum_retention_pct += retention_rate * 100.0
            count_retention += 1

        views_total = record.get("views_total")
        if views_total is not None and views_total >= 500_000:
            viral_count += 1

        views_first_hour = record.get("views_first_hour")
        if views_first_hour is not None:
            sum_views_first_hour += float(views_first_hour)
            count_views_first_hour += 1

    # Compute key metrics
    if count_retention > 0:
        avg_retention_pct = round(sum_retention_pct / count_retention, 2)
    else:
        avg_retention_pct = 0.0

    if total_videos > 0:
        viral_hit_pct = round((viral_count / total_videos) * 100.0, 2)
    else:
        viral_hit_pct = 0.0

    if count_views_first_hour > 0:
        avg_first_hour_views = round(sum_views_first_hour / count_views_first_hour, 2)
    else:
        avg_first_hour_views = 0.0

    key_metrics: Dict[str, Any] = {
        "Total Videos": total_videos,
        "Average Retention Rate (%)": avg_retention_pct,
        "Viral Hit Percentage (%)": viral_hit_pct,
        "Average First-Hour Views": avg_first_hour_views,
    }

    result: Dict[str, Any] = {
        "key_metrics": key_metrics,
        "accounts": accounts,
    }

    return result