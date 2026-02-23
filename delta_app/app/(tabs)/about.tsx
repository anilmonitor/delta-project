import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Platform, Image, TouchableOpacity, Linking } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function AboutScreen() {
  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  const socials = [
    { name: 'Instagram', url: 'https://instagram.com/anilmonitor' },
    { name: 'YouTube', url: 'https://youtube.com/anilmonitor' },
    { name: 'LinkedIn', url: 'https://linkedin.com/in/anilmonitor' },
    { name: 'GitHub', url: 'https://github.com/anilmonitor' },
    { name: 'Telegram', url: 'https://t.me/ANIlMONITOR' },
    { name: 'Twitter', url: 'https://twitter.com/anilmonitor' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>About the Creator</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.card}>
          <Image 
            source={{ uri: 'https://xpertbite.in/wp-content/uploads/2024/10/MrAnil-768x1319.jpg' }} 
            style={styles.profileImg} 
            resizeMode="cover"
          />
          <Text style={styles.title}>Who am I?</Text>
          <View style={styles.divider} />
          
          <Text style={styles.paragraph}>
            Hi, I’m Anil. I’m a tech content creator with a strong passion for Web Development and teaching.
          </Text>
          <Text style={styles.paragraph}>
            I’m a Tech Content Creator on YouTube – @anilmonitor and @anilengineer, where I share valuable content related to technology.
          </Text>
          <Text style={styles.paragraph}>
            I created this platform to help students learn, grow, and achieve their goal of getting a job in their dream company.
          </Text>
        </View>

        <View style={styles.socialCard}>
          <Text style={styles.socialTitle}>CONNECT WITH ME</Text>
          <View style={styles.socialGrid}>
            {socials.map((social) => (
              <TouchableOpacity
                key={social.name}
                style={styles.socialBtn}
                onPress={() => openLink(social.url)}
              >
                <Text style={styles.socialText}>{social.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#f8fafc', textAlign: 'center' },
  scrollContent: { padding: 15, paddingBottom: 100 },
  card: {
    backgroundColor: '#334155',
    padding: 25,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  profileImg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#3b82f6',
  },
  title: { fontSize: 22, color: '#f1f5f9', fontWeight: 'bold', marginBottom: 10 },
  divider: { width: 50, height: 4, backgroundColor: '#3b82f6', borderRadius: 2, marginBottom: 20 },
  paragraph: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 24,
    marginBottom: 15,
    textAlign: 'center',
  },
  socialCard: { alignItems: 'center', paddingVertical: 10 },
  socialTitle: { fontSize: 16, color: '#94a3b8', fontWeight: 'bold', letterSpacing: 2, marginBottom: 20 },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  socialBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#475569',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    minWidth: '45%',
    alignItems: 'center',
  },
  socialText: { color: '#f8fafc', fontWeight: '600', fontSize: 15 },
});
