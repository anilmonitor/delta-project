import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, ScrollView, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import videosData from '@/constants/videos.json';
import { formatBytes } from '@/utils/format';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function BatchScreen() {
  const [downloading, setDownloading] = useState<number | null>(null);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const handleDownloadPart = async (start: number, end: number, partNum: number) => {
    if (Platform.OS !== 'web') {
      if (permissionResponse?.status !== 'granted') {
        const resp = await requestPermission();
        if (resp.status !== 'granted') {
          Alert.alert('Permission needed', 'Allow media access to save videos to your gallery.');
          return;
        }
      }
    }

    const startDownload = async () => {
      setDownloading(partNum);
      try {
        for (let i = start; i < end; i++) {
          const video = videosData[i];
          if (!video || !video.mp4Url) continue;
          
          const safeName = video.title.replace(/[^a-z0-9\s]/gi, '').trim() || `video_${i + 1}`;
          const filename = `${String(i + 1).padStart(3, '0')}_${safeName}.mp4`;

          if (Platform.OS === 'web') {
            const res = await fetch(video.mp4Url);
            if (!res.ok) continue;
            const blob = await res.blob();
            const localBlobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = localBlobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(localBlobUrl), 15000);
            await new Promise(r => setTimeout(r, 1000));
            continue;
          }

          // @ts-ignore
          const fileUri = `${FileSystem.documentDirectory}${filename}`;

          const downloadResumable = FileSystem.createDownloadResumable(
            video.mp4Url,
            fileUri
          );

          const result = await downloadResumable.downloadAsync();
          
          if (result && result.uri) {
            await MediaLibrary.saveToLibraryAsync(result.uri);
            // Clean up local app directory
            await FileSystem.deleteAsync(result.uri, { idempotent: true });
          }
        }
        
        if (Platform.OS === 'web') {
          alert(`Batch ${partNum} download complete! Check your downloads.`);
        } else {
          Alert.alert('Success', `Batch ${partNum} download complete! Check your gallery.`);
        }
      } catch (err: any) {
        console.error("Batch download error:", err);
        if (Platform.OS === 'web') {
          alert("An error occurred during batch download: " + err.message);
        } else {
          Alert.alert("Error", "An error occurred during batch download: " + err.message);
        }
      } finally {
        setDownloading(null);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to download ${end - start} videos sequentially? It may take a while and consumes battery/data.`)) {
        startDownload();
      }
    } else {
      Alert.alert(
        "Confirm Batch Download",
        `Are you sure you want to download ${end - start} videos sequentially? It may take a while and consumes battery/data.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Start", onPress: startDownload }
        ]
      );
    }
  };

  const parts = [
    { label: 'Part 1 (1 to 56)', start: 0, end: 56 },
    { label: 'Part 2 (57 to 112)', start: 56, end: 112 },
    { label: 'Part 3 (113 to 168)', start: 112, end: 168 },
    { label: 'Part 4 (169 to 204)', start: 168, end: 204 },
    { label: 'Part 5 (205 to 224)', start: 204, end: 224 }
  ];

  const totalCourseSize = videosData.reduce((acc, curr) => acc + (curr.size || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Full Course Archive</Text>
        <Text style={styles.headerSubtitle}>Download complete sets of lectures.</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.list}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Videos are split into 5 batches for reliability. Downloading saves them directly to your device gallery.
          </Text>
          <Text style={styles.infoHighlight}>
            Total course size: {formatBytes(totalCourseSize)}
          </Text>
        </View>

        {parts.map((p, i) => {
          const partSize = videosData.slice(p.start, p.end).reduce((acc, curr) => acc + (curr.size || 0), 0);
          const isDownloading = downloading === i + 1;
          const isDisabled = downloading !== null && downloading !== i + 1;

          return (
            <View key={i} style={[styles.card, isDisabled && { opacity: 0.5 }]}>
              <View style={styles.info}>
                <Text style={styles.title}>{p.label}</Text>
                <Text style={styles.size}>Size: {formatBytes(partSize)}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.downloadBtn, isDownloading && styles.downloadingBtn]} 
                onPress={() => handleDownloadPart(p.start, p.end, i + 1)}
                disabled={isDisabled}
              >
                {isDownloading ? (
                  <>
                    <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
                    <Text style={styles.btnText}>Loading...</Text>
                  </>
                ) : (
                  <>
                    <IconSymbol name="chevron.down.circle.fill" size={20} color="#fff" />
                    <Text style={styles.btnText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e293b' },
  header: { 
    padding: 20, 
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    backgroundColor: '#0f172a', 
    borderBottomWidth: 1, 
    borderBottomColor: '#334155' 
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#f8fafc', marginBottom: 5 },
  headerSubtitle: { fontSize: 14, color: '#94a3b8' },
  list: { padding: 15, paddingBottom: 100 },
  infoCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoText: { color: '#94a3b8', fontSize: 15, lineHeight: 22, marginBottom: 10 },
  infoHighlight: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  info: { flex: 1, marginRight: 10 },
  title: { fontSize: 18, color: '#f1f5f9', fontWeight: 'bold', marginBottom: 6 },
  size: { fontSize: 14, color: '#94a3b8' },
  downloadBtn: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
  },
  downloadingBtn: { backgroundColor: '#64748b' },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 6 }
});
