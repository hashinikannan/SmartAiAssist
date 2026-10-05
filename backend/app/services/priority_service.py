from datetime import datetime
from typing import Dict, Any, List

def calculate_topic_priority_score(
    exam_date_str: str,
    difficulty: str,        # "Easy", "Medium", "Hard"
    confidence: str,        # "Low", "Medium", "High"
    last_studied_str: str = None,
    mastery_score: int = 50
) -> Dict[str, Any]:
    """
    Calculates deterministic priority score for a topic.
    Formula: Exam Urgency (0-40) + Difficulty (0-25) + Weakness (0-25) + Revision Need (0-10)
    Total Max: 100
    """
    # 1. Exam Urgency (0-40)
    urgency_score = 10
    days_to_exam = 30
    if exam_date_str:
        try:
            today = datetime.now().date()
            exam_date = datetime.strptime(exam_date_str, "%Y-%m-%d").date()
            days_to_exam = (exam_date - today).days
            if days_to_exam <= 1:
                urgency_score = 40
            elif days_to_exam <= 3:
                urgency_score = 35
            elif days_to_exam <= 7:
                urgency_score = 30
            elif days_to_exam <= 14:
                urgency_score = 22
            elif days_to_exam <= 30:
                urgency_score = 15
            else:
                urgency_score = 8
        except Exception:
            urgency_score = 15

    # 2. Topic Difficulty (0-25)
    difficulty_map = {"Hard": 25, "Medium": 15, "Easy": 5}
    diff_score = difficulty_map.get(difficulty, 15)

    # 3. Weakness / Low Confidence (0-25)
    confidence_map = {"Low": 25, "Medium": 12, "High": 3}
    weakness_score = confidence_map.get(confidence, 12)
    # Factor in mastery_score if low
    if mastery_score < 40:
        weakness_score = min(25, weakness_score + 8)

    # 4. Revision Need (0-10)
    revision_score = 5
    if last_studied_str:
        try:
            last_date = datetime.fromisoformat(last_studied_str).date()
            days_since = (datetime.now().date() - last_date).days
            if days_since > 7:
                revision_score = 10
            elif days_since > 3:
                revision_score = 7
            else:
                revision_score = 2
        except Exception:
            revision_score = 5
    else:
        revision_score = 8  # Never studied yet

    total_score = urgency_score + diff_score + weakness_score + revision_score

    priority_label = "LOW"
    if total_score >= 65:
        priority_label = "HIGH"
    elif total_score >= 45:
        priority_label = "MEDIUM"

    return {
        "score": total_score,
        "priority_label": priority_label,
        "days_to_exam": days_to_exam,
        "breakdown": {
            "urgency": urgency_score,
            "difficulty": diff_score,
            "weakness": weakness_score,
            "revision": revision_score
        }
    }
