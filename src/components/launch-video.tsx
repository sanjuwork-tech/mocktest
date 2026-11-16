"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import "./launch-video.css";

/**
 * The landing-page launch video (public/media/ourmocks-launch.*). It plays muted and only while at least
 * half of it is on screen; with prefers-reduced-motion it never autoplays and shows the poster until the
 * student presses Play. The section heading and copy around it live in page.tsx as plain HTML.
 */
export function LaunchVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const pausedByUser = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) el.pause();
        else if (!pausedByUser.current) el.play().catch(() => {});
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    pausedByUser.current = !el.paused;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  return (
    <figure className="launch-video">
      <div className="launch-video-frame">
        <video
          ref={video}
          src="/media/ourmocks-launch.mp4"
          poster="/media/ourmocks-launch.jpg"
          width={1280}
          height={720}
          muted
          loop
          playsInline
          preload="none"
          aria-label="OurMocks walkthrough: a student answers a CUET UG Physics question on the NTA-style test screen, submits the test, and sees time-per-question analysis that flags rushed, slow and time-sink questions."
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        <button type="button" className="launch-video-toggle" onClick={toggle}>
          {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          {playing ? "Pause video" : "Play video"}
        </button>
      </div>
      <figcaption>A 20-second look at a real CUET UG Physics Test 1: attempt, submit, analysis.</figcaption>
    </figure>
  );
}
