"use client";

import { useEffect, useMemo, useState } from "react";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default function TourViewer({ tour, mode }) {
  const [sceneId, setSceneId] = useState(tour.scenes[0].id);
  const [floor, setFloor] = useState(tour.scenes[0].floor);
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [hfov, setHfov] = useState(90);
  const [transitioning, setTransitioning] = useState(false);
  const [autoSpin, setAutoSpin] = useState(true);

  const scene = useMemo(() => tour.scenes.find((s) => s.id === sceneId), [tour.scenes, sceneId]);
  const isViewerMode = mode === "viewer";
  const activeFloor = useMemo(
    () => tour.floors.find((item) => item.id === floor) || { id: floor, name: floor },
    [tour.floors, floor]
  );

  useEffect(() => {
    let raf = 0;
    const spin = () => {
      setYaw((value) => (autoSpin ? (value + 0.2) % 360 : value));
      raf = requestAnimationFrame(spin);
    };

    raf = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(raf);
  }, [autoSpin]);

  useEffect(() => {
    const onMove = (event) => {
      if (typeof event.beta === "number") {
        setPitch(clamp(event.beta / 2, -85, 85));
      }
      if (typeof event.alpha === "number") {
        setYaw(event.alpha);
      }
    };

    window.addEventListener("deviceorientation", onMove);
    return () => window.removeEventListener("deviceorientation", onMove);
  }, []);

  const onSceneChange = (toScene) => {
    setTransitioning(true);
    setTimeout(() => {
      const next = tour.scenes.find((s) => s.id === toScene);
      if (next) {
        setSceneId(next.id);
        setFloor(next.floor);
        setPitch(0);
      }
      setTransitioning(false);
    }, 220);
  };

  const sceneList = tour.scenes.filter((item) => item.floor === floor);

  return (
    <main className="tour-root">
      <div className={`pano-frame ${transitioning ? "fading" : ""}`}>
        <img
          src={scene.image}
          alt={`${scene.id} panorama`}
          className="pano-image"
          style={{ transform: `scale(${1 + (110 - hfov) / 500}) translate3d(${yaw / 22}px, ${-pitch / 3}px, 0)` }}
        />
      </div>

      <div className="vignette" />

      {scene.hotspots.map((hotspot, index) => (
        <button
          key={hotspot.id}
          className={`hotspot arrow-${index % 3}`}
          onClick={() => onSceneChange(hotspot.toScene)}
          style={{
            left: `${50 + hotspot.yaw / 6}%`,
            top: `${50 - hotspot.pitch * 1.2}%`,
          }}
          aria-label={`Go to ${hotspot.label}`}
        >
          <span className="arrow">➜</span>
          {!isViewerMode && <span className="hotspot-label">{hotspot.label}</span>}
        </button>
      ))}

      {isViewerMode && <div className="top-chip share-chip">SHARE MODE · YAW {Math.round(yaw)}°</div>}

      {!isViewerMode && (
        <>
          <div className="top-chip">{scene.name} · GYRO ACTIVE</div>

          <div className="hud-chip">
            <span>FOV {Math.round(hfov)}°</span>
            <span>YAW {Math.round(yaw)}°</span>
            <span>PITCH {Math.round(pitch)}°</span>
          </div>

          <div className="control-stack left">
            <button onClick={() => setHfov((v) => clamp(v - 10, 50, 120))}>+</button>
            <button onClick={() => setHfov((v) => clamp(v + 10, 50, 120))}>-</button>
            <button
              onClick={() => {
                setHfov(90);
                setPitch(0);
                setYaw(0);
              }}
            >
              Home
            </button>
          </div>

          <div className="control-stack right">
            <button onClick={() => setAutoSpin((v) => !v)}>{autoSpin ? "Stop Spin" : "Auto Spin"}</button>
            <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/tour/${tour.id}?mode=viewer`)}>
              Copy Share Link
            </button>
          </div>

          <div className="floor-panel">
            <p>{activeFloor.name}</p>
            <div>
              {tour.floors.map((label) => (
                <button
                  key={label.id}
                  className={label.id === floor ? "active" : ""}
                  onClick={() => {
                    setFloor(label.id);
                    const firstScene = tour.scenes.find((item) => item.floor === label.id);
                    if (firstScene) {
                      onSceneChange(firstScene.id);
                    }
                  }}
                >
                  {label.id}
                </button>
              ))}
            </div>
            <small>{sceneList.length} scene(s) on this floor</small>
          </div>
        </>
      )}
    </main>
  );
}
