import { useRef } from 'react';
import { useFormContext } from 'react-hook-form';

const MAX_PX = 200;
const JPEG_QUALITY = 0.7;

function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = Math.min(MAX_PX / img.width, MAX_PX / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };
    img.src = url;
  });
}

export function ProfileImageField() {
  const { setValue, watch } = useFormContext();
  const profileImage = watch('profileImage');
  const inputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setValue('profileImage', compressed);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative size-24 overflow-hidden rounded-full border-2 border-dashed border-border bg-muted transition-colors hover:border-primary"
      >
        {profileImage ? (
          <img src={profileImage} alt="프로필 미리보기" className="h-full w-full object-cover" />
        ) : (
          <span className="text-3xl">📷</span>
        )}
      </button>
      <span className="text-xs text-muted-foreground">
        {profileImage ? '사진 변경' : '프로필 사진 추가 (선택)'}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
