'use client'

import { useRef } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useProfileAvatar } from '@/hooks/use-profile-avatar'
import { cn } from '@/lib/utils'

type AvatarSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<
  AvatarSize,
  { avatar: string; letter: string; camera: string; loader: string }
> = {
  sm: {
    avatar: 'size-9',
    letter: 'text-sm',
    camera: 'size-4 [&_svg]:size-2.5',
    loader: 'size-4',
  },
  md: {
    avatar: 'size-11',
    letter: 'text-base',
    camera: 'size-5 [&_svg]:size-3',
    loader: 'size-5',
  },
  lg: {
    avatar: 'size-14',
    letter: 'text-lg',
    camera: 'size-5 [&_svg]:size-3.5',
    loader: 'size-6',
  },
}

type Props = {
  initial: string
  className?: string
  size?: AvatarSize
}

export function UserProfileAvatar({ initial, className, size = 'lg' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { profilePictureUrl, loading, uploading, error, upload, remove } =
    useProfileAvatar()

  const letter = (initial?.charAt(0) || '?').toUpperCase()
  const s = sizeClasses[size]

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    await upload(file)
  }

  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'relative rounded-full ring-2 ring-transparent hover:ring-[#39d2c0]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#39d2c0]',
            className
          )}
          aria-label="Change profile photo"
        >
          <Avatar className={cn(s.avatar, 'bg-[#39d2c0]/30')}>
            {profilePictureUrl && (
              <AvatarImage
                src={profilePictureUrl}
                alt="Your profile photo"
                className="object-cover"
              />
            )}
            <AvatarFallback
              className={cn(
                'bg-[#39d2c0]/30 text-[#39d2c0] font-semibold',
                s.letter
              )}
            >
              {loading ? (
                <Loader2 className={cn(s.loader, 'animate-spin')} aria-hidden />
              ) : (
                letter
              )}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-500 shadow-md',
              s.camera
            )}
            aria-hidden
          >
            <Camera className="text-gray-700 dark:text-gray-200" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0 z-[200] overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl"
      >
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Your profile photo
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
            Tap your avatar anytime to update. JPEG, PNG, WebP, or GIF — up to 2&nbsp;MB.
          </p>
        </div>

        <div className="px-4 py-4 space-y-4 bg-white dark:bg-gray-900">
          <div className="flex flex-col items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/90 px-4 py-5">
            <Avatar className="size-28 shrink-0 ring-4 ring-white dark:ring-gray-900 shadow-md">
              {profilePictureUrl && (
                <AvatarImage
                  src={profilePictureUrl}
                  alt="Preview"
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-[#39d2c0]/30 text-[#39d2c0] text-3xl font-semibold">
                {letter}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-4 text-center">
              {profilePictureUrl ? 'Photo on your account' : `Letter avatar (${letter})`}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center max-w-[220px]">
              {profilePictureUrl
                ? 'This is how it appears in your header.'
                : 'Upload a photo to replace the letter.'}
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => void onFileChange(e)}
          />

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              className="w-full bg-[#005DFF] hover:bg-[#0047cc] text-white"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Uploading…
                </>
              ) : (
                <>
                  <Camera className="size-4 mr-2" />
                  {profilePictureUrl ? 'Change photo' : 'Upload photo'}
                </>
              )}
            </Button>
            {profilePictureUrl && (
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                disabled={uploading}
                onClick={() => void remove()}
              >
                Use letter avatar ({letter})
              </Button>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 rounded-md bg-red-50 dark:bg-red-950/40 px-2 py-1.5">
              {error}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Larger block for Settings → Account */
export function ProfilePhotoSettingsBlock({
  initial,
}: {
  initial: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { profilePictureUrl, loading, uploading, error, upload, remove } =
    useProfileAvatar()
  const letter = (initial?.charAt(0) || '?').toUpperCase()

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    await upload(file)
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
        Profile photo
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Upload a photo or keep your letter avatar in the header.
      </p>
      <div className="flex items-center gap-4">
        <Avatar className="size-24 shrink-0 ring-2 ring-gray-100 dark:ring-gray-800">
          {profilePictureUrl && (
            <AvatarImage
              src={profilePictureUrl}
              alt="Your profile"
              className="object-cover"
            />
          )}
          <AvatarFallback className="bg-[#39d2c0]/30 text-[#39d2c0] text-2xl font-semibold">
            {loading ? <Loader2 className="size-6 animate-spin" /> : letter}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2 flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => void onFileChange(e)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Uploading…' : 'Upload photo'}
          </Button>
          {profilePictureUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={() => void remove()}
            >
              Use letter avatar ({letter})
            </Button>
          )}
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
      )}
    </div>
  )
}
