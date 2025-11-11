-- Add pet_type column to pets table
ALTER TABLE pets ADD COLUMN IF NOT EXISTS pet_type TEXT;

-- Add a comment
COMMENT ON COLUMN pets.pet_type IS 'Type of pet: dog, cat, fish, bird, rabbit, turtle, hamster, other';
