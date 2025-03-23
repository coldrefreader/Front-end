import { useContext, useRef, useEffect } from "react";
import { SettingsContext } from "../context/SettingsContext";

export default function VideoBackground() {
  const { animationsEnabled } = useContext(SettingsContext);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let retryInterval;
    let timeoutId;

    const attemptPlay = () => {
      if (animationsEnabled && video.paused) {
        video.loop = true; // Ensure loop is set
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Retried play(): Video is playing; paused:", video.paused);
            })
            .catch((err) => {
              console.error("Retried play() error:", err);
            });
        } else {
          console.log("play() returned undefined on retry");
        }
      }
    };

    // Delay the first play attempt slightly
    const initialDelay = setTimeout(() => {
      attemptPlay();
      // Set an interval to retry if the video is still paused
      retryInterval = setInterval(attemptPlay, 500);
    }, 100);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(retryInterval);
      clearTimeout(timeoutId);
    };
  }, [animationsEnabled]);

  return (
    <video
      ref={videoRef}
      muted
      preload="auto"
      className="video-bg"
    >
      <source src="/globe_video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
