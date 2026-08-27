import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser, setUser } from '@/features/auth/authSlice';
import { profileUpdateSchema } from '@/features/profile/profileSchemas';
import {
  useUpdateProfileMutation,
  useUpdateProfileImageMutation,
} from '@/features/profile/profileApi';

export function useUpdateProfile() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      nickname: user?.nickname ?? '',
      nationality: user?.nationality ?? '',
      profileImage: user?.profileImageUrl ?? null,
    },
  });

  const { mutateAsync: updateProfile, isPending: isProfilePending } = useUpdateProfileMutation();
  const { mutateAsync: updateProfileImage, isPending: isImagePending } =
    useUpdateProfileImageMutation();

  const profileImage = form.watch('profileImage');
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!profileImage) return;

    updateProfileImage({ profileImage }).then((result) => {
      dispatch(setUser({ ...user, profileImageUrl: result.profileImageUrl }));
    });
  }, [profileImage]); // eslint-disable-line react-hooks/exhaustive-deps

  const isPending = isProfilePending || isImagePending;

  async function onSubmit(data) {
    const { nickname, nationality } = data;

    try {
      await updateProfile({ nickname, nationality });
      dispatch(setUser({ ...user, nickname, nationality }));
      navigate('/my', { replace: true });
    } catch (err) {
      if (err?.code === 'INVALID_INPUT') {
        err.errors?.forEach((e) => form.setError(e.field, { message: e.reason }));
      }
    }
  }

  return { form, isPending, onSubmit: form.handleSubmit(onSubmit) };
}
