import { useContext, useRef, useEffect } from "react";
import { SettingsContext } from "../context/SettingsContext";

export default function VideoBackground() {
  const { animationsEnabled } = useContext(SettingsContext);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let retryInterval;

    const attemptPlay = () => {
      if (animationsEnabled && video.paused) {
        video.loop = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Video is playing; paused:", video.paused);
            })
            .catch((err) => {
              console.error("Error playing video:", err);
            });
        }
      } else if (!animationsEnabled && !video.paused) {
        // Pause the video if animations are disabled
        video.pause();
      }
    };

    // Delay the first play attempt slightly
    const initialDelay = setTimeout(() => {
      attemptPlay();
      retryInterval = setInterval(attemptPlay, 500);
    }, 100);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(retryInterval);
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
