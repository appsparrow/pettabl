import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dog, Heart, Calendar, Users, Shield, Smartphone } from 'lucide-react-native';
import { colors } from '../theme/colors';

const logo = require('../../assets/logo-pettabl.png');

export default function LandingScreen({ navigation }: any) {
  const isWeb = Platform.OS === 'web';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <LinearGradient
        colors={[colors.primary + '10', colors.background, colors.accent + '10']}
        style={styles.gradient}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.subtitle}>Modern Pet Care Coordination 🐾</Text>
          
          <Text style={styles.description}>
            Seamlessly coordinate pet care between owners and caretakers. 
            Track activities, manage schedules, and keep your furry friends happy.
          </Text>
          
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Auth')}
            >
              <Text style={styles.primaryButtonText}>Get Started Free 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.features}>
          <Text style={styles.sectionTitle}>Everything Your Pets Need</Text>
          
          <View style={styles.featureGrid}>
            <FeatureCard
              icon={<Calendar size={32} color={colors.primary} />}
              title="Smart Scheduling"
              description="Custom care schedules for feeding, walks, and playtime"
            />
            
            <FeatureCard
              icon={<Users size={32} color={colors.primary} />}
              title="Easy Coordination"
              description="Invite caretakers and track completion in real-time"
            />
            
            <FeatureCard
              icon={<Heart size={32} color={colors.primary} />}
              title="Activity Tracking"
              description="Photo updates, notes, and timestamps for every interaction"
            />
            
            <FeatureCard
              icon={<Shield size={32} color={colors.primary} />}
              title="Secure & Private"
              description="Enterprise-grade security. Only authorized users can access"
            />
            
            <FeatureCard
              icon={<Smartphone size={32} color={colors.primary} />}
              title="Mobile & Web"
              description="Access from any device. Your pet care hub is always with you"
            />
            
            <FeatureCard
              icon={<Dog size={32} color={colors.primary} />}
              title="Multi-Pet Support"
              description="Manage multiple pets with profiles, schedules, and history"
            />
          </View>
        </View>

        {/* CTA Section */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.cta}
        >
          <Text style={styles.ctaTitle}>Ready to Transform Pet Care?</Text>
          <Text style={styles.ctaSubtitle}>
            Join pet owners and caretakers who trust Pettabl for seamless coordination
          </Text>
          
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.ctaButtonText}>Get Started — It's Free! 🎉</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Footer */}
        <View style={styles.footer}>
          <Image source={logo} style={styles.footerLogo} resizeMode="contain" />
          <Text style={styles.footerText}>© 2025 Pettabl. Made with ❤️ for pets everywhere.</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => navigation.navigate('Auth')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
            <Text style={styles.footerDivider}>•</Text>
            <Text style={styles.footerLink}>Contact</Text>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <View style={styles.featureCard}>
    <View style={styles.featureIcon}>{icon}</View>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradient: {
    flex: 1,
    minHeight: '100%',
  },
  hero: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: 280,
    height: 120,
  },
  title: {
    fontSize: 56,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: colors.textMuted,
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 600,
    lineHeight: 28,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  features: {
    paddingVertical: 80,
    paddingHorizontal: 20,
    backgroundColor: `${colors.primary}05`,
  },
  sectionTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 48,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
    maxWidth: 1200,
    alignSelf: 'center',
  },
  featureCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    width: Platform.OS === 'web' ? 350 : '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 24,
  },
  cta: {
    paddingVertical: 80,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaSubtitle: {
    fontSize: 20,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 600,
  },
  ctaButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    paddingVertical: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: `${colors.muted}30`,
  },
  footerLogo: {
    width: 180,
    height: 64,
  },
  footerText: {
    color: colors.textMuted,
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  footerLink: {
    color: colors.textMuted,
    fontSize: 14,
  },
  footerDivider: {
    color: colors.textMuted,
    fontSize: 14,
  },
});

