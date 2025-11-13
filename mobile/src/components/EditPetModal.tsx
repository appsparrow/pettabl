import { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { uploadImageToR2, deleteImageFromR2 } from '../lib/r2-storage';

type Props = {
  visible: boolean;
  onClose: () => void;
  pet: any;
  onSaved: () => void;
};

const PET_TYPES = ['dog', 'cat', 'fish', 'bird', 'rabbit', 'turtle', 'hamster', 'other'] as const;
type PetType = typeof PET_TYPES[number];

export function EditPetModal({ visible, onClose, pet, onSaved }: Props) {
  const [name, setName] = useState(pet?.name ?? '');
  const [petType, setPetType] = useState<PetType>(pet?.pet_type ?? 'dog');
  const [breed, setBreed] = useState(pet?.breed ?? '');
  const [age, setAge] = useState(pet?.age ? String(pet.age) : '');
  const [food, setFood] = useState(pet?.food_preferences ?? '');
  const [medical, setMedical] = useState(pet?.medical_info ?? '');
  const [vet, setVet] = useState(pet?.vet_contact ?? '');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && pet) {
      setName(pet.name ?? '');
      setPetType((pet.pet_type as PetType) ?? 'dog');
      setBreed(pet.breed ?? '');
      setAge(pet.age ? String(pet.age) : '');
      setFood(pet.food_preferences ?? '');
      setMedical(pet.medical_info ?? '');
      setVet(pet.vet_contact ?? '');
      setPhotoUri(null);
    }
  }, [visible, pet]);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const savePet = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a pet name.');
      return;
    }
    setSaving(true);
    try {
      let photo_url: string | null | undefined = undefined;
      
      // Upload new photo to R2 if selected
      if (photoUri) {
        // Delete old photo from R2 if exists
        if (pet.photo_url && pet.photo_url.includes('r2.cloudflarestorage.com')) {
          try {
            await deleteImageFromR2(pet.photo_url);
          } catch (error) {
            console.error('Error deleting old photo:', error);
          }
        }

        // Upload new photo to R2
        photo_url = await uploadImageToR2(photoUri, 'pets', true);
        Alert.alert('Success', 'Pet photo uploaded! 📸');
      }
      
      const update: any = {
        name,
        pet_type: petType,
        breed: breed || null,
        age: age ? Number(age) : null,
        food_preferences: food || null,
        medical_info: medical || null,
        vet_contact: vet || null,
      };
      if (photo_url !== undefined) update.photo_url = photo_url;

      const { error } = await supabase.from('pets').update(update).eq('id', pet.id);
      if (error) throw error;
      onSaved();
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save pet');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Edit Pet</Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
            <TouchableOpacity style={styles.photo} onPress={pickPhoto}>
              {photoUri || pet?.photo_url ? (
                <Image source={{ uri: photoUri || pet?.photo_url }} style={styles.photoImg} />
              ) : (
                <Text style={styles.photoPlaceholder}>📷 Change Photo</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Pet Name</Text>
            <TextInput placeholder="Eg. Charlie" value={name} onChangeText={setName} style={styles.input} />
            <Text style={styles.label}>Pet Type</Text>
            <View style={styles.typeRow}>
              {PET_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setPetType(t)}
                  style={[styles.typeChip, petType === t && styles.typeChipActive]}
                >
                  <Text style={[styles.typeText, petType === t && styles.typeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Breed</Text>
            <TextInput placeholder="Eg. Golden Retriever" value={breed} onChangeText={setBreed} style={styles.input} />
            <Text style={styles.label}>Age (years)</Text>
            <TextInput placeholder="Eg. 4" value={age} onChangeText={setAge} keyboardType="number-pad" style={styles.input} />
            <Text style={styles.label}>Food Preferences</Text>
            <TextInput placeholder="Meal schedule, brands..." value={food} onChangeText={setFood} style={styles.input} />
            <Text style={styles.label}>Medical Info</Text>
            <TextInput placeholder="Medications, allergies..." value={medical} onChangeText={setMedical} style={styles.input} />
            <Text style={styles.label}>Vet Contact</Text>
            <TextInput placeholder="Clinic name, phone" value={vet} onChangeText={setVet} style={styles.input} />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={[styles.cancelButton, { flex: 1 }]} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={saving} style={[styles.primaryButton, { flex: 1 }]} onPress={savePet}>
                <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '88%' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: colors.text },
  photo: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  photoImg: { width: 120, height: 120, borderRadius: 60 },
  photoPlaceholder: { color: colors.textMuted },
  label: { fontSize: 14, fontWeight: '600', color: colors.textMuted, marginBottom: 6, marginTop: 10 },
  input: { height: 52, borderWidth: 2, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, marginBottom: 12 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typeChip: { borderWidth: 2, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  typeChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  typeText: { color: colors.textMuted, fontWeight: '600' },
  typeTextActive: { color: colors.primary },
  primaryButton: { height: 52, backgroundColor: colors.primary, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  cancelButton: { height: 52, backgroundColor: '#f3f4f6', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  cancelButtonText: { color: colors.textMuted, fontWeight: '600' },
});


