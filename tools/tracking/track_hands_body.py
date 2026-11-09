#!/usr/bin/env python3
"""Patch Bags hand + full-body tracker for LOCAL webcam / video diagnostics.

Uses MediaPipe Tasks (21 landmarks per hand, 33 body landmarks), OpenCV, and
temporal smoothing. All tracking stays on the machine running this script.
This is a desktop/offline developer tool; GitHub Pages cannot execute Python.

Usage:
  python tools/tracking/download_models.py
  pip install -r tools/tracking/requirements.txt
  python tools/tracking/track_hands_body.py --source 0 --display
  python tools/tracking/track_hands_body.py --source test.mp4 --jsonl results.jsonl
"""
from __future__ import annotations

import argparse
import contextlib
import json
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any


HAND_EDGES = (
    (0, 1), (1, 2), (2, 3), (3, 4),
    (0, 5), (5, 6), (6, 7), (7, 8),
    (5, 9), (9, 10), (10, 11), (11, 12),
    (9, 13), (13, 14), (14, 15), (15, 16),
    (13, 17), (17, 18), (18, 19), (19, 20), (0, 17),
)
POSE_EDGES = (
    (11, 12), (11, 13), (13, 15), (12, 14), (14, 16),
    (11, 23), (12, 24), (23, 24),
    (23, 25), (25, 27), (24, 26), (26, 28),
)
HERE = Path(__file__).resolve().parent
DEFAULT_MODELS = HERE / "models"


@dataclass
class EMA:
    """Simple low-jitter smoothing; reset automatically when tracking is lost."""

    factor: float = 0.46

    def __post_init__(self) -> None:
        self.previous: list[list[tuple[float, float, float]]] = []

    def smooth(self, groups: list[list[Any]]) -> list[list[dict[str, float]]]:
        result: list[list[dict[str, float]]] = []
        if len(groups) != len(self.previous):
            self.previous = []
        for group_id, group in enumerate(groups):
            old = self.previous[group_id] if group_id < len(self.previous) else []
            values: list[tuple[float, float, float]] = []
            for i, point in enumerate(group):
                x, y, z = float(point.x), float(point.y), float(point.z)
                if i < len(old):
                    px, py, pz = old[i]
                    a = self.factor
                    x, y, z = px + a * (x - px), py + a * (y - py), pz + a * (z - pz)
                values.append((x, y, z))
            if group_id >= len(self.previous):
                self.previous.append(values)
            else:
                self.previous[group_id] = values
            result.append([{"x": round(x, 6), "y": round(y, 6), "z": round(z, 6)}
                           for x, y, z in values])
        return result


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Track 21-point hands and 33-point full body locally."
    )
    parser.add_argument("--source", default="0",
                        help="Camera index (0,1...) or local video filename")
    parser.add_argument("--models", type=Path, default=DEFAULT_MODELS,
                        help="Folder with hand_landmarker.task and pose_landmarker_full.task")
    parser.add_argument("--display", action="store_true",
                        help="Show annotated live window (press Q to quit)")
    parser.add_argument("--mirror", action="store_true",
                        help="Mirror camera input like a selfie preview")
    parser.add_argument("--jsonl", type=Path, help="Save LOCAL per-frame landmarks as JSONL")
    parser.add_argument("--output-video", type=Path,
                        help="Save annotated video LOCALLY (no upload)")
    parser.add_argument("--no-pose", action="store_true",
                        help="Use hand tracking only on slower computers")
    parser.add_argument("--hands", type=int, default=2, choices=(1, 2))
    parser.add_argument("--width", type=int, default=1280)
    parser.add_argument("--height", type=int, default=720)
    parser.add_argument("--max-frames", type=int, default=0,
                        help="0 means process the entire source")
    parser.add_argument("--smoothing", type=float, default=0.46,
                        help="EMA responsiveness from 0.05 to 1.0")
    return parser


def require_models(folder: Path, no_pose: bool) -> tuple[Path, Path | None]:
    hand = folder / "hand_landmarker.task"
    pose = folder / "pose_landmarker_full.task"
    for item in [hand] + ([] if no_pose else [pose]):
        if not item.is_file() or item.stat().st_size < 100_000:
            raise FileNotFoundError(
                f"Missing model: {item}\n"
                "Run: python tools/tracking/download_models.py"
            )
    return hand, None if no_pose else pose


def draw_groups(
    frame: Any, groups: list[list[dict[str, float]]],
    edges: tuple[tuple[int, int], ...], color: tuple[int, int, int],
    cv2_module: Any,
) -> None:
    h, w = frame.shape[:2]
    for points in groups:
        for i, j in edges:
            if i >= len(points) or j >= len(points):
                continue
            a, b = points[i], points[j]
            cv2_module.line(
                frame, (int(a["x"] * w), int(a["y"] * h)),
                (int(b["x"] * w), int(b["y"] * h)), color, 2
            )
        for p in points:
            x, y = int(p["x"] * w), int(p["y"] * h)
            cv2_module.circle(frame, (x, y), 3, color, -1)


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if not 0.05 <= args.smoothing <= 1.0:
        raise SystemExit("--smoothing must be between 0.05 and 1.0")
    hands_model, pose_model = require_models(args.models, args.no_pose)
    try:
        import cv2
        import mediapipe as mp
    except ImportError as error:
        raise SystemExit(
            f"Missing dependency: {error}. Install: "
            "pip install -r tools/tracking/requirements.txt"
        ) from error

    BaseOptions = mp.tasks.BaseOptions
    vision = mp.tasks.vision
    mode = vision.RunningMode.VIDEO
    hand_opts = vision.HandLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=str(hands_model)),
        running_mode=mode,
        num_hands=args.hands,
        min_hand_detection_confidence=0.60,
        min_hand_presence_confidence=0.55,
        min_tracking_confidence=0.60,
    )
    pose_opts = (vision.PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=str(pose_model)),
        running_mode=mode,
        num_poses=1,
        min_pose_detection_confidence=0.60,
        min_pose_presence_confidence=0.55,
        min_tracking_confidence=0.60,
        output_segmentation_masks=False,
    ) if pose_model is not None else None)

    camera_source: int | str = (int(args.source) if args.source.isdecimal()
                                else args.source)
    camera = isinstance(camera_source, int)
    cap = cv2.VideoCapture(camera_source)
    if not cap.isOpened():
        raise SystemExit(f"Unable to open camera/video: {args.source}")
    if camera:
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, args.width)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, args.height)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    if not 1 <= fps <= 240:
        fps = 30.0
    writer = None
    frame_id = 0
    last_timestamp = -1
    hand_filter, pose_filter = EMA(args.smoothing), EMA(args.smoothing)
    last_loop_time = time.perf_counter()
    fps_ema = 0.0
    if args.jsonl:
        args.jsonl.parent.mkdir(parents=True, exist_ok=True)
    print("Patch Bags tracker: local processing; NO network transmission of camera data")
    print("Model:", hands_model, "| Body:", pose_model or "disabled")
    try:
        with contextlib.ExitStack() as stack:
            hand_detector = stack.enter_context(
                vision.HandLandmarker.create_from_options(hand_opts)
            )
            pose_detector = (stack.enter_context(
                vision.PoseLandmarker.create_from_options(pose_opts)
            ) if pose_opts else None)
            out = (stack.enter_context(args.jsonl.open("w", encoding="utf-8"))
                   if args.jsonl else None)

            while cap.isOpened():
                ok, frame = cap.read()
                if not ok:
                    break
                if args.mirror:
                    frame = cv2.flip(frame, 1)
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                timestamp = (int(time.monotonic() * 1000) if camera
                             else round(frame_id * 1000.0 / fps))
                timestamp = max(timestamp, last_timestamp + 1)
                last_timestamp = timestamp
                image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
                hand_result = hand_detector.detect_for_video(image, timestamp)
                pose_result = (pose_detector.detect_for_video(image, timestamp)
                               if pose_detector else None)
                detected_hands = hand_filter.smooth(hand_result.hand_landmarks)
                detected_pose = pose_filter.smooth(
                    pose_result.pose_landmarks if pose_result else []
                )

                now = time.perf_counter()
                measured_fps = 1.0 / max(1e-5, now - last_loop_time)
                fps_ema = measured_fps if frame_id == 0 else (fps_ema * .88 + measured_fps * .12)
                last_loop_time = now

                if out:
                    handedness = []
                    for group in hand_result.handedness:
                        category = group[0] if group else None
                        handedness.append({
                            "label": getattr(category, "category_name", ""),
                            "confidence": round(float(getattr(category, "score", 0.0)), 4)
                        })
                    row = {
                        "frame": frame_id, "timestamp_ms": timestamp,
                        "width": frame.shape[1], "height": frame.shape[0],
                        "hands": detected_hands, "handedness": handedness,
                        "body": detected_pose, "fps": round(fps_ema, 2),
                    }
                    out.write(json.dumps(row, ensure_ascii=False) + "\n")

                if args.display or args.output_video:
                    draw_groups(frame, detected_hands, HAND_EDGES, (75, 235, 120), cv2)
                    draw_groups(frame, detected_pose, POSE_EDGES, (100, 185, 255), cv2)
                    cv2.putText(
                        frame,
                        f"Hands {len(detected_hands)} | Pose {len(detected_pose)} | FPS {fps_ema:.1f}",
                        (16, 32), cv2.FONT_HERSHEY_SIMPLEX, .7, (255, 255, 255), 2
                    )
                if args.output_video:
                    if writer is None:
                        args.output_video.parent.mkdir(parents=True, exist_ok=True)
                        writer = cv2.VideoWriter(
                            str(args.output_video),
                            cv2.VideoWriter_fourcc(*"mp4v"),
                            max(5.0, min(fps, 60.0)),
                            (frame.shape[1], frame.shape[0])
                        )
                        if not writer.isOpened():
                            raise OSError("Could not open local video output")
                    writer.write(frame)
                if args.display:
                    cv2.imshow("Patch Bags | Hand + Body Tracking", frame)
                    if cv2.waitKey(1) & 0xFF in (ord("q"), 27):
                        break
                frame_id += 1
                if args.max_frames and frame_id >= args.max_frames:
                    break
                if frame_id % 60 == 0:
                    print(f"Frames {frame_id} | hands {len(detected_hands)} | "
                          f"body {len(detected_pose)} | processing FPS {fps_ema:.1f}")
    except KeyboardInterrupt:
        print("Interrupted; closing local camera.")
    finally:
        cap.release()
        if writer is not None:
            writer.release()
        if args.display:
            cv2.destroyAllWindows()
    print(f"Finished: {frame_id} frames")
    return 0


if __name__ == "__main__":
    sys.exit(main())
