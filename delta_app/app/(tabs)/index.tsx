import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import videosData from '@/constants/videos.json';
import { formatBytes } from '@/utils/format';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HomeScreen() {
  const [downloading, setDownloading] = useState<number | null>(null);

  const handleDownload = async (video: any, index: number) => {
    if (!video.mp4Url) {
      Alert.alert('Error', 'No MP4 URL found');
      return;
    }

    setDownloading(index);
    try {
      const safeName = video.title.replace(/[^a-z0-9\s]/gi, '').trim() || `video_${index + 1}`;
      
      if (Platform.OS === 'web') {
        const res = await fetch(video.mp4Url);
        if (!res.ok) throw new Error("Video stream blocked or timed out");
        
        const blob = await res.blob();
        const localBlobUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = localBlobUrl;
        a.download = `${safeName}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(localBlobUrl), 10000);
        setDownloading(null);
        return;
      }

      // @ts-ignore
      const fileUri = `${FileSystem.documentDirectory}${safeName}.mp4`;

      const downloadResumable = FileSystem.createDownloadResumable(
        video.mp4Url,
        fileUri,
        {},
        (downloadProgress) => {
          // Could track progress here
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (result && result.uri) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(result.uri, {
            mimeType: 'video/mp4',
            dialogTitle: `Share ${safeName}`
          });
        } else {
          Alert.alert('Success', `File saved to ${result.uri}`);
        }
      }
    } catch (err: any) {
      console.error(err);
      if (Platform.OS === 'web') {
        alert('Download Error: ' + err.message);
      } else {
        Alert.alert('Download Error', err.message);
      }
    } finally {
      setDownloading(null);
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.index}>{index + 1}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.size}>{formatBytes(item.size)}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.downloadBtn, downloading === index && styles.downloadingBtn]} 
        onPress={() => handleDownload(item, index)}
        disabled={downloading === index}
      >
        {downloading === index ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <IconSymbol name="chevron.down.circle.fill" size={24} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Apna College Delta Project</Text>
        <Text style={styles.headerSubtitle}>Download your lectures easily.</Text>
      </View>
      
      <FlatList
        data={videosData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  info: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  index: { fontSize: 18, fontWeight: 'bold', color: '#60a5fa', marginRight: 15, width: 35, textAlign: 'center' },
  title: { fontSize: 16, color: '#f1f5f9', fontWeight: '500', marginBottom: 4 },
  size: { fontSize: 12, color: '#94a3b8' },
  downloadBtn: {
    backgroundColor: '#3b82f6',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadingBtn: { backgroundColor: '#64748b' }
});
