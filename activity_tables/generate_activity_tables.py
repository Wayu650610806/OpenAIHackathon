from __future__ import annotations

import csv
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path


BASE_DATE = datetime(2026, 5, 8, 0, 0)
OUTPUT_DIR = Path(__file__).resolve().parent


@dataclass(frozen=True)
class Segment:
    start: str
    end: str
    action: str


def build_times() -> list[datetime]:
    return [BASE_DATE + timedelta(minutes=5 * i) for i in range(288)]


def minutes_since_midnight(dt: datetime) -> int:
    return dt.hour * 60 + dt.minute


def hhmm_to_minutes(value: str) -> int:
    hour, minute = value.split(":")
    return int(hour) * 60 + int(minute)


def expand_profile(segments: list[Segment]) -> list[str]:
    actions: list[str] = []
    for point in build_times():
        minute = minutes_since_midnight(point)
        action = None
        for segment in segments:
            start_minute = hhmm_to_minutes(segment.start)
            end_minute = hhmm_to_minutes(segment.end)
            if start_minute <= minute <= end_minute:
                action = segment.action
                break
        if action is None:
            raise ValueError(f"No action assigned for {point:%H:%M}")
        actions.append(action)
    return actions


def write_csv(filename: str, actions: list[str]) -> None:
    path = OUTPUT_DIR / filename
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["time", "action"])
        for timestamp, action in zip(build_times(), actions):
            writer.writerow([timestamp.strftime("%Y-%m-%d %H:%M"), action])


PROFILES: dict[str, dict[str, object]] = {
    "exhausted_patient": {
        "description": "ผู้ป่วยหมดแรง นอนเป็นหลักแทบทั้งวัน มีลุกนั่งหรือเดินสั้นมากเฉพาะจำเป็น",
        "segments": [
            Segment("00:00", "05:55", "lying"),
            Segment("06:00", "06:00", "get_up"),
            Segment("06:05", "06:10", "standing"),
            Segment("06:15", "06:20", "walking"),
            Segment("06:25", "06:25", "get_down"),
            Segment("06:30", "08:55", "lying"),
            Segment("09:00", "09:00", "get_up"),
            Segment("09:05", "09:10", "standing"),
            Segment("09:15", "09:25", "sitting"),
            Segment("09:30", "09:30", "get_down"),
            Segment("09:35", "11:55", "lying"),
            Segment("12:00", "12:00", "get_up"),
            Segment("12:05", "12:15", "sitting"),
            Segment("12:20", "12:25", "standing"),
            Segment("12:30", "12:35", "walking"),
            Segment("12:40", "12:40", "get_down"),
            Segment("12:45", "15:55", "lying"),
            Segment("16:00", "16:00", "get_up"),
            Segment("16:05", "16:15", "sitting"),
            Segment("16:20", "16:20", "get_down"),
            Segment("16:25", "18:25", "lying"),
            Segment("18:30", "18:30", "get_up"),
            Segment("18:35", "18:40", "standing"),
            Segment("18:45", "18:50", "walking"),
            Segment("18:55", "19:10", "sitting"),
            Segment("19:15", "19:15", "get_down"),
            Segment("19:20", "23:55", "lying"),
        ],
    },
    "dementia_night_wandering": {
        "description": "ผู้ป่วยมีภาวะสมองเสื่อม เดินมากผิดปกติช่วงกลางคืน กลางวันมีพักนอนและนั่งบ้าง",
        "segments": [
            Segment("00:00", "00:10", "walking"),
            Segment("00:15", "00:20", "standing"),
            Segment("00:25", "00:35", "walking"),
            Segment("00:40", "00:50", "no_person"),
            Segment("00:55", "01:10", "walking"),
            Segment("01:15", "01:15", "get_down"),
            Segment("01:20", "01:40", "sitting"),
            Segment("01:45", "01:45", "get_up"),
            Segment("01:50", "02:20", "walking"),
            Segment("02:25", "02:30", "standing"),
            Segment("02:35", "02:50", "walking"),
            Segment("02:55", "03:10", "no_person"),
            Segment("03:15", "03:35", "walking"),
            Segment("03:40", "03:40", "get_down"),
            Segment("03:45", "04:05", "sitting"),
            Segment("04:10", "04:10", "get_up"),
            Segment("04:15", "04:35", "walking"),
            Segment("04:40", "05:00", "standing"),
            Segment("05:05", "05:05", "get_down"),
            Segment("05:10", "06:25", "lying"),
            Segment("06:30", "06:30", "get_up"),
            Segment("06:35", "06:50", "walking"),
            Segment("06:55", "07:15", "sitting"),
            Segment("07:20", "07:20", "get_up"),
            Segment("07:25", "07:40", "walking"),
            Segment("07:45", "08:15", "sitting"),
            Segment("08:20", "08:20", "get_down"),
            Segment("08:25", "10:55", "lying"),
            Segment("11:00", "11:00", "get_up"),
            Segment("11:05", "11:20", "sitting"),
            Segment("11:25", "11:40", "walking"),
            Segment("11:45", "11:50", "standing"),
            Segment("11:55", "12:20", "sitting"),
            Segment("12:25", "12:25", "get_down"),
            Segment("12:30", "14:55", "lying"),
            Segment("15:00", "15:00", "get_up"),
            Segment("15:05", "15:20", "walking"),
            Segment("15:25", "15:55", "sitting"),
            Segment("16:00", "16:00", "get_up"),
            Segment("16:05", "16:20", "walking"),
            Segment("16:25", "16:30", "standing"),
            Segment("16:35", "16:35", "get_down"),
            Segment("16:40", "18:25", "lying"),
            Segment("18:30", "18:30", "get_up"),
            Segment("18:35", "19:00", "sitting"),
            Segment("19:05", "19:30", "walking"),
            Segment("19:35", "19:35", "get_down"),
            Segment("19:40", "20:25", "lying"),
            Segment("20:30", "20:30", "get_up"),
            Segment("20:35", "21:05", "walking"),
            Segment("21:10", "21:20", "standing"),
            Segment("21:25", "21:45", "walking"),
            Segment("21:50", "21:55", "no_person"),
            Segment("22:00", "22:20", "walking"),
            Segment("22:25", "22:25", "get_down"),
            Segment("22:30", "22:50", "sitting"),
            Segment("22:55", "22:55", "get_up"),
            Segment("23:00", "23:55", "walking"),
        ],
    },
    "depressed_sedentary": {
        "description": "ผู้ป่วยมีภาวะเศร้า นั่งเป็นหลักเกือบทั้งวัน เคลื่อนไหวน้อยมาก และเข้านอนค่อนข้างตรงเวลา",
        "segments": [
            Segment("00:00", "06:55", "lying"),
            Segment("07:00", "07:00", "get_up"),
            Segment("07:05", "07:10", "standing"),
            Segment("07:15", "07:20", "walking"),
            Segment("07:25", "07:25", "get_down"),
            Segment("07:30", "09:55", "sitting"),
            Segment("10:00", "10:00", "get_up"),
            Segment("10:05", "10:10", "standing"),
            Segment("10:15", "10:20", "walking"),
            Segment("10:25", "10:25", "get_down"),
            Segment("10:30", "12:25", "sitting"),
            Segment("12:30", "12:35", "no_person"),
            Segment("12:40", "14:55", "sitting"),
            Segment("15:00", "15:00", "get_up"),
            Segment("15:05", "15:10", "standing"),
            Segment("15:15", "15:20", "walking"),
            Segment("15:25", "15:25", "get_down"),
            Segment("15:30", "18:25", "sitting"),
            Segment("18:30", "18:30", "get_up"),
            Segment("18:35", "18:40", "walking"),
            Segment("18:45", "18:45", "get_down"),
            Segment("18:50", "21:25", "sitting"),
            Segment("21:30", "21:30", "get_down"),
            Segment("21:35", "23:55", "lying"),
        ],
    },
    "insomnia_restless_night": {
        "description": "ผู้ป่วยนอนไม่หลับ ลุกขึ้นลงสลับกันหลายครั้งตอนกลางคืน กลางวันยังมีการนั่งและเดินได้บ้าง",
        "segments": [
            Segment("00:00", "00:20", "lying"),
            Segment("00:25", "00:25", "get_up"),
            Segment("00:30", "00:35", "standing"),
            Segment("00:40", "00:50", "walking"),
            Segment("00:55", "00:55", "get_down"),
            Segment("01:00", "01:20", "sitting"),
            Segment("01:25", "01:25", "get_down"),
            Segment("01:30", "01:50", "lying"),
            Segment("01:55", "01:55", "get_up"),
            Segment("02:00", "02:05", "standing"),
            Segment("02:10", "02:20", "walking"),
            Segment("02:25", "02:25", "get_down"),
            Segment("02:30", "02:45", "sitting"),
            Segment("02:50", "02:50", "get_down"),
            Segment("02:55", "03:15", "lying"),
            Segment("03:20", "03:20", "get_up"),
            Segment("03:25", "03:30", "standing"),
            Segment("03:35", "03:50", "walking"),
            Segment("03:55", "03:55", "get_down"),
            Segment("04:00", "04:20", "sitting"),
            Segment("04:25", "04:25", "get_up"),
            Segment("04:30", "04:35", "standing"),
            Segment("04:40", "04:45", "walking"),
            Segment("04:50", "04:50", "get_down"),
            Segment("04:55", "05:40", "lying"),
            Segment("05:45", "05:45", "get_up"),
            Segment("05:50", "06:00", "standing"),
            Segment("06:05", "06:20", "walking"),
            Segment("06:25", "07:25", "sitting"),
            Segment("07:30", "07:30", "get_up"),
            Segment("07:35", "07:50", "walking"),
            Segment("07:55", "08:25", "sitting"),
            Segment("08:30", "08:30", "get_up"),
            Segment("08:35", "08:45", "walking"),
            Segment("08:50", "09:10", "no_person"),
            Segment("09:15", "09:20", "walking"),
            Segment("09:25", "10:55", "sitting"),
            Segment("11:00", "11:00", "get_down"),
            Segment("11:05", "12:25", "lying"),
            Segment("12:30", "12:30", "get_up"),
            Segment("12:35", "12:45", "walking"),
            Segment("12:50", "13:30", "sitting"),
            Segment("13:35", "13:35", "get_down"),
            Segment("13:40", "14:55", "lying"),
            Segment("15:00", "15:00", "get_up"),
            Segment("15:05", "15:20", "walking"),
            Segment("15:25", "16:25", "sitting"),
            Segment("16:30", "16:30", "get_up"),
            Segment("16:35", "16:45", "walking"),
            Segment("16:50", "18:25", "sitting"),
            Segment("18:30", "18:30", "get_down"),
            Segment("18:35", "19:25", "lying"),
            Segment("19:30", "19:30", "get_up"),
            Segment("19:35", "19:45", "walking"),
            Segment("19:50", "20:20", "sitting"),
            Segment("20:25", "20:25", "get_down"),
            Segment("20:30", "21:10", "lying"),
            Segment("21:15", "21:15", "get_up"),
            Segment("21:20", "21:25", "standing"),
            Segment("21:30", "21:40", "walking"),
            Segment("21:45", "21:45", "get_down"),
            Segment("21:50", "22:20", "sitting"),
            Segment("22:25", "22:25", "get_down"),
            Segment("22:30", "22:50", "lying"),
            Segment("22:55", "22:55", "get_up"),
            Segment("23:00", "23:05", "standing"),
            Segment("23:10", "23:20", "walking"),
            Segment("23:25", "23:25", "get_down"),
            Segment("23:30", "23:55", "sitting"),
        ],
    },
    "normal_sleep_cycle": {
        "description": "ผู้ป่วยนอนหลับดี กลางคืนนอนต่อเนื่อง กลางวันมีนั่ง เดิน และออกจากพื้นที่บางช่วง",
        "segments": [
            Segment("00:00", "05:55", "lying"),
            Segment("06:00", "06:00", "get_up"),
            Segment("06:05", "06:10", "standing"),
            Segment("06:15", "06:30", "walking"),
            Segment("06:35", "07:10", "sitting"),
            Segment("07:15", "07:15", "get_up"),
            Segment("07:20", "07:35", "walking"),
            Segment("07:40", "08:25", "sitting"),
            Segment("08:30", "08:30", "get_up"),
            Segment("08:35", "08:55", "walking"),
            Segment("09:00", "09:20", "no_person"),
            Segment("09:25", "09:35", "walking"),
            Segment("09:40", "10:25", "sitting"),
            Segment("10:30", "10:30", "get_up"),
            Segment("10:35", "10:50", "walking"),
            Segment("10:55", "11:25", "standing"),
            Segment("11:30", "12:20", "sitting"),
            Segment("12:25", "12:25", "get_down"),
            Segment("12:30", "13:20", "lying"),
            Segment("13:25", "13:25", "get_up"),
            Segment("13:30", "13:45", "walking"),
            Segment("13:50", "14:25", "sitting"),
            Segment("14:30", "14:30", "get_up"),
            Segment("14:35", "15:00", "walking"),
            Segment("15:05", "15:50", "sitting"),
            Segment("15:55", "15:55", "get_up"),
            Segment("16:00", "16:20", "walking"),
            Segment("16:25", "16:45", "standing"),
            Segment("16:50", "17:30", "sitting"),
            Segment("17:35", "17:35", "get_up"),
            Segment("17:40", "18:00", "walking"),
            Segment("18:05", "18:45", "sitting"),
            Segment("18:50", "18:50", "get_up"),
            Segment("18:55", "19:10", "walking"),
            Segment("19:15", "20:10", "sitting"),
            Segment("20:15", "20:15", "get_down"),
            Segment("20:20", "23:55", "lying"),
        ],
    },
}


def write_summary() -> None:
    summary_path = OUTPUT_DIR / "README.md"
    with summary_path.open("w", encoding="utf-8") as handle:
        handle.write("# Activity Tables\n\n")
        handle.write("ชุดข้อมูลตัวอย่าง 24 ชั่วโมง ความละเอียดทุก 5 นาที โดยแต่ละไฟล์มี 2 คอลัมน์: `time`, `action`\n\n")
        handle.write("ช่วงเวลาอ้างอิง: 2026-05-08 00:00 ถึง 2026-05-08 23:55\n\n")
        handle.write("## Profiles\n\n")
        for name, payload in PROFILES.items():
            handle.write(f"- `{name}.csv`: {payload['description']}\n")
        handle.write("\n## Action Labels\n\n")
        handle.write("- `no_person`: ไม่มีคนอยู่ในพื้นที่ที่กล้องหรือเซนเซอร์มอนิเตอร์\n")
        handle.write("- `standing`: ยืนอยู่กับที่\n")
        handle.write("- `walking`: กำลังเดินหรือเคลื่อนที่\n")
        handle.write("- `sitting`: กำลังนั่ง\n")
        handle.write("- `lying`: กำลังนอนหรือนอนราบ\n")
        handle.write("- `get_up`: ช่วงเปลี่ยนจากนั่ง/นอนเป็นลุกขึ้น\n")
        handle.write("- `get_down`: ช่วงเปลี่ยนจากยืนเป็นนั่งหรือนอน\n")


def main() -> None:
    for name, payload in PROFILES.items():
        actions = expand_profile(payload["segments"])  # type: ignore[index]
        write_csv(f"{name}.csv", actions)
    write_summary()


if __name__ == "__main__":
    main()
