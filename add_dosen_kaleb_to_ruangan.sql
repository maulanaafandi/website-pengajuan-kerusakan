ALTER TABLE ruangan
  ADD COLUMN id_user INT NULL AFTER lokasi;

-- Jika kolom dosen_kaleb sudah pernah dibuat dan berisi id_user, pindahkan datanya:
-- ALTER TABLE ruangan ADD COLUMN id_user INT NULL AFTER lokasi;
-- UPDATE ruangan SET id_user = dosen_kaleb WHERE dosen_kaleb REGEXP '^[0-9]+$';
