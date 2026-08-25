import { useRef } from 'react';
import { useFormContext } from 'react-hook-form';

export function ProfileImageField() {
  const { setValue, watch } = useFormContext();
  const profileImage = watch('profileImage');
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setValue('profileImage', reader.result);
    reader.readAsDataURL(file);
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
