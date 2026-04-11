import { BlurView } from "expo-blur";
import { CameraView, useCameraPermissions } from "expo-camera";
import { DeviceMotion } from "expo-sensors";
import { Aperture, Camera, ChevronLeft, ChevronRight, Focus, Grid, Home, LayoutList, Share2 } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, Image, Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

function formatDeg(value) {
  if (!Number.isFinite(value)) return 0;
  const normalized = ((value % 360) + 360) % 360;
  return Math.round(normalized);
}

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const [screen, setScreen] = useState("splash");
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [capturedFrames, setCapturedFrames] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState("L1");

  const floorTours = {
    L1: ["Reception Lobby", "Grand Ballroom"],
    L2: ["Mezzanine Gallery", "Sky Lounge"],
    L3: ["Rooftop Deck", "Executive Deck"],
  };

  useEffect(() => {
    const timer = setTimeout(() => setScreen("home"), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    DeviceMotion.setUpdateInterval(60);

    const subscription = DeviceMotion.addListener((event) => {
      const rotation = event?.rotation || {};
      setYaw(formatDeg(rotation.alpha || 0));
      setPitch(Math.round((rotation.beta || 0) * 57.3));
      setRoll(Math.round((rotation.gamma || 0) * 57.3));
    });

    return () => subscription.remove();
  }, []);

  const ghost = useMemo(() => {
    if (!capturedFrames.length) return null;
    return capturedFrames[capturedFrames.length - 1];
  }, [capturedFrames]);

  const captureFrame = async () => {
    if (!cameraRef.current) return;

    // Use extreme quality for 4K rendering workflow
    const photo = await cameraRef.current.takePictureAsync({ quality: 1, skipProcessing: true, exif: true });

    const frameMeta = {
      uri: photo.uri,
      yaw,
      pitch,
      roll,
      at: new Date().toISOString(),
    };

    setCapturedFrames((frames) => [...frames, frameMeta]);

    try {
      await fetch("http://localhost:3000/api/frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourId: "demo", ...frameMeta }),
      });
    } catch {
      // Ignore API errors in local/offline capture mode.
    }
  };

  const isCapture = screen === "capture";
  const isViewer = screen === "viewer";

  if (screen === "splash") {
    return (
      <View style={styles.splashWrap}>
        <StatusBar barStyle="light-content" />
        <View style={styles.splashOrb}>
          <Aperture size={42} color="#00D8FF" strokeWidth={1.5} />
        </View>
        <Text style={styles.splashTitle}>360virtual PRO</Text>
        <Text style={styles.splashSub}>4K Capture & Engine Rendering</Text>
        <ActivityIndicator size="small" color="#00D8FF" style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (screen === "home") {
    return (
      <SafeAreaView style={styles.homeWrap}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.homeTitle}>Studio Dash</Text>
          <Text style={styles.homeSub}>Manage 4K Assets & Tours</Text>
        </View>

        <View style={styles.floorCard}>
          <View style={styles.floorHeader}>
            <LayoutList size={18} color="#fff" />
            <Text style={styles.floorHeading}>Location Planner</Text>
          </View>
          <View style={styles.floorBtnRow}>
            {Object.keys(floorTours).map((floor) => (
              <Pressable
                key={floor}
                style={[styles.floorBtn, selectedFloor === floor && styles.floorBtnActive]}
                onPress={() => setSelectedFloor(floor)}
              >
                <Text style={[styles.floorBtnText, selectedFloor === floor && styles.floorBtnTextActive]}>{floor}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.tourList}>
            {floorTours[selectedFloor].map((name) => (
              <View key={name} style={styles.tourItemRow}>
                <View style={styles.statusDot} />
                <Text style={styles.tourItem}>{name}</Text>
                <Text style={styles.tag4k}>4K HDR</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.modeRow}>
          <Pressable style={styles.modeBtn} onPress={() => setScreen("capture")}>
            <Camera size={24} color="#00D8FF" />
            <Text style={styles.btnText}>Capture 4K</Text>
          </Pressable>
          <Pressable style={styles.modeBtnSecondary} onPress={() => setScreen("viewer")}>
            <Aperture size={24} color="#FFF" />
            <Text style={styles.btnText}>4K Viewer</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionWrap}>
        <Camera size={48} color="#888" />
        <Text style={styles.permissionTitle}>Camera Required</Text>
        <Text style={styles.permissionSub}>Enable access to capture high-res virtual tours.</Text>
        <Pressable style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.btnText}>Enable Access</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {isCapture ? (
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" focusDepth={1} />
      ) : (
        <View style={StyleSheet.absoluteFill}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1558238692-747d6a54bdcb?q=80&w=2672&auto=format&fit=crop" }} 
            style={StyleSheet.absoluteFillObject} 
            resizeMode="cover" 
          />
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
        </View>
      )}

      {ghost && isCapture && (
        <Image source={{ uri: ghost.uri }} style={styles.ghostOverlay} resizeMode="cover" />
      )}

      {isCapture && (
        <View style={styles.guideWrapper} pointerEvents="none">
          <View style={styles.gridLineHorizontal} />
          <View style={[styles.gridLineHorizontal, { top: "66.6%" }]} />
          <View style={styles.gridLineVertical} />
          <View style={[styles.gridLineVertical, { left: "66.6%" }]} />
          
          <View style={styles.crosshair}>
            <Focus size={42} color="rgba(0, 216, 255, 0.8)" />
          </View>
        </View>
      )}

      <SafeAreaView style={styles.overlayContainer} pointerEvents="box-none">
        
        <View style={styles.topBar}>
          <BlurView intensity={40} tint="dark" style={styles.glassChip}>
             <Text style={styles.chipText}>GYRO {yaw}°</Text>
          </BlurView>
          {isCapture && (
            <BlurView intensity={40} tint="dark" style={styles.glassChip}>
              <Text style={styles.chipText}>PITCH {pitch}°</Text>
            </BlurView>
          )}
          {isViewer && (
            <BlurView intensity={40} tint="dark" style={[styles.glassChip, { borderColor: "#00D8FF", borderWidth: 1 }]}>
               <Text style={[styles.chipText, { color: "#00D8FF" }]}>4K RENDERED</Text>
            </BlurView>
          )}
        </View>

        {isCapture && (
          <View style={styles.bottomControls}>
            <Pressable style={styles.navBtnGlass} onPress={() => setScreen("viewer")}>
               <Aperture size={20} color="#FFF" />
            </Pressable>

            <View style={styles.captureRing}>
              <Pressable style={styles.captureBtnInner} onPress={captureFrame} />
            </View>

            <Pressable style={styles.navBtnGlass} onPress={() => setCapturedFrames([])}>
              <Grid size={20} color={capturedFrames.length > 0 ? "#FF4A4A" : "#FFF"} />
            </Pressable>
          </View>
        )}

        {isViewer && (
           <View style={styles.viewerBottom}>
             <Text style={styles.infoText}>Swipe or tilt to explore in 360°</Text>
             <View style={styles.viewerOnlyArrows}>
              <Pressable style={styles.arrowBtn}><ChevronLeft size={28} color="#fff" /></Pressable>
              
              <Pressable style={styles.actionBtnGlass} onPress={() => setScreen("capture")}>
                 <Camera size={18} color="#00D8FF" />
                 <Text style={styles.btnText}>Recapture</Text>
              </Pressable>
              <Pressable style={styles.actionBtnGlass} onPress={() => setScreen("home")}>
                 <Home size={18} color="#FFF" />
              </Pressable>

              <Pressable style={styles.arrowBtn}><ChevronRight size={28} color="#fff" /></Pressable>
             </View>
           </View>
        )}

        {isCapture && (
          <Pressable style={styles.homeFloating} onPress={() => setScreen("home")}>
            <Home size={20} color="#FFF" />
          </Pressable>
        )}

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020408" },
  overlayContainer: { flex: 1, justifyContent: "space-between" },
  splashWrap: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#020408", gap: 8 },
  splashOrb: { width: 90, height: 90, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0, 216, 255, 0.1)", borderWidth: 1, borderColor: "rgba(0, 216, 255, 0.3)", marginBottom: 12 },
  splashTitle: { color: "#FFF", fontSize: 28, fontWeight: "900", letterSpacing: 1 },
  splashSub: { color: "#8B9BB4", fontSize: 13, textTransform: "uppercase", letterSpacing: 2 },
  homeWrap: { flex: 1, backgroundColor: "#020408", padding: 24 },
  header: { marginTop: 20, marginBottom: 30 },
  homeTitle: { color: "#FFF", fontSize: 32, fontWeight: "800", letterSpacing: 0.5 },
  homeSub: { color: "#8B9BB4", fontSize: 15, marginTop: 4 },
  floorCard: { borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 24, padding: 20, backgroundColor: "rgba(255,255,255,0.03)" },
  floorHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  floorHeading: { color: "#FFF", fontWeight: "700", fontSize: 16, letterSpacing: 0.5 },
  floorBtnRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  floorBtn: { borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "rgba(255,255,255,0.05)" },
  floorBtnActive: { backgroundColor: "rgba(0, 216, 255, 0.15)", borderColor: "rgba(0, 216, 255, 0.5)" },
  floorBtnText: { color: "#8B9BB4", fontWeight: "600", fontSize: 13 },
  floorBtnTextActive: { color: "#00D8FF" },
  tourList: { gap: 12 },
  tourItemRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#00D8FF", marginRight: 12 },
  tourItem: { color: "#E2E8F0", fontSize: 15, flex: 1, fontWeight: "500" },
  tag4k: { fontSize: 10, color: "#00D8FF", borderWidth: 1, borderColor: "rgba(0, 216, 255, 0.3)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: "800" },
  modeRow: { marginTop: 24, flexDirection: "row", gap: 16 },
  modeBtn: { flex: 1, borderRadius: 20, borderWidth: 1, borderColor: "rgba(0, 216, 255, 0.4)", backgroundColor: "rgba(0, 216, 255, 0.1)", alignItems: "center", justifyContent: "center", paddingVertical: 20, gap: 8 },
  modeBtnSecondary: { flex: 1, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)", backgroundColor: "rgba(255, 255, 255, 0.05)", alignItems: "center", justifyContent: "center", paddingVertical: 20, gap: 8 },
  permissionWrap: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#020408", gap: 12, padding: 30 },
  permissionTitle: { color: "#FFF", fontSize: 22, fontWeight: "700", marginTop: 10 },
  permissionSub: { color: "#8B9BB4", fontSize: 14, textAlign: "center", marginBottom: 20 },
  primaryBtn: { borderRadius: 999, paddingHorizontal: 24, paddingVertical: 14, backgroundColor: "#00D8FF" },
  btnText: { color: "#FFF", fontWeight: "700", fontSize: 14, letterSpacing: 0.5 },
  topBar: { marginTop: 60, alignSelf: "center", flexDirection: "row", gap: 12 },
  glassChip: { borderRadius: 999, overflow: "hidden", paddingHorizontal: 16, paddingVertical: 8 },
  chipText: { color: "#FFF", fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  guideWrapper: { ...StyleSheet.absoluteFillObject },
  gridLineHorizontal: { position: "absolute", width: "100%", height: 1, backgroundColor: "rgba(255,255,255,0.15)", top: "33.3%" },
  gridLineVertical: { position: "absolute", height: "100%", width: 1, backgroundColor: "rgba(255,255,255,0.15)", left: "33.3%" },
  crosshair: { position: "absolute", top: "50%", left: "50%", marginTop: -21, marginLeft: -21 },
  ghostOverlay: { ...StyleSheet.absoluteFillObject, opacity: 0.25 },
  bottomControls: { marginBottom: 40, flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" },
  navBtnGlass: { width: 56, height: 56, borderRadius: 28, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  captureRing: { width: 88, height: 88, borderRadius: 44, borderWidth: 4, borderColor: "#00D8FF", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" },
  captureBtnInner: { width: 66, height: 66, borderRadius: 33, backgroundColor: "#FFF" },
  viewerBottom: { marginBottom: 40, alignItems: "center" },
  infoText: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 20 },
  viewerOnlyArrows: { flexDirection: "row", alignItems: "center", gap: 16 },
  actionBtnGlass: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.5)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", overflow: "hidden" },
  homeFloating: { position: "absolute", top: 60, right: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.4)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  arrowBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(0,0,0,0.4)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }
});
