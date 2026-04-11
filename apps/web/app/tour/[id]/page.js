import TourViewer from "@/components/TourViewer";

export default async function TourPage({ params, searchParams }) {
  const routeParams = await params;
  const query = await searchParams;
  const mode = query?.mode === "viewer" ? "viewer" : "full";

  const tour = {
    id: routeParams.id,
    floors: [
      { id: "L1", name: "Ground Floor" },
      { id: "L2", name: "Premium Floor" },
      { id: "L3", name: "Sky Deck" }
    ],
    scenes: [
      {
        id: "lobby",
        name: "Reception Lobby",
        floor: "L1",
        image: "/panos/lobby.jpg",
        hotspots: [
          { id: "to-ballroom", yaw: 36, pitch: -5, toScene: "ballroom", label: "Grand Ballroom" },
          { id: "to-mezzanine", yaw: -34, pitch: -2, toScene: "mezzanine", label: "Mezzanine" }
        ]
      },
      {
        id: "ballroom",
        name: "Grand Ballroom",
        floor: "L1",
        image: "/panos/ballroom.jpg",
        hotspots: [
          { id: "back-lobby", yaw: -28, pitch: -4, toScene: "lobby", label: "Back to Lobby" }
        ]
      },
      {
        id: "mezzanine",
        name: "Mezzanine Gallery",
        floor: "L2",
        image: "/panos/mezzanine.jpg",
        hotspots: [
          { id: "down-lobby", yaw: 14, pitch: -8, toScene: "lobby", label: "Lobby Below" },
          { id: "to-skydeck", yaw: 44, pitch: -2, toScene: "skydeck", label: "Sky Deck" }
        ]
      },
      {
        id: "skydeck",
        name: "Rooftop Sky Deck",
        floor: "L3",
        image: "/panos/mezzanine.jpg",
        hotspots: [
          { id: "to-mezzanine", yaw: -22, pitch: -5, toScene: "mezzanine", label: "Back to Mezzanine" }
        ]
      }
    ]
  };

  return <TourViewer tour={tour} mode={mode} />;
}
