import type { Character, GalleryPhoto } from '../../store';

export type GalleryTab = 'all' | 'favorites' | 'hidden' | 'wechat';
export type GalleryView = 'home' | 'collection' | 'imports' | 'detail';
export type GalleryAlbumFilter = '全部' | GalleryPhoto['album'];
export type GalleryPhotoSource = NonNullable<GalleryPhoto['source']>;

export const galleryAlbums: GalleryPhoto['album'][] = ['生活', '自拍', '截图', '风景', '隐藏', '聊天'];
export const gallerySources: Array<{ source: GalleryPhotoSource; label: string }> = [
  { source: 'upload', label: '本地上传' },
  { source: 'image-bed', label: '图床' },
  { source: 'wechat', label: '微信照片墙' },
  { source: 'chat', label: '聊天图片' },
  { source: 'moment', label: '朋友圈' },
  { source: 'generated', label: 'AI 生图' },
];

export function filterGalleryPhotos(
  photos: GalleryPhoto[],
  options: { tab: GalleryTab; albumFilter: GalleryAlbumFilter },
) {
  return photos
    .filter((photo) => {
      if (options.tab === 'favorites' && !photo.favorite) return false;
      if (options.tab === 'hidden' && !photo.hidden && photo.album !== '隐藏') return false;
      if (options.tab === 'wechat' && photo.source !== 'wechat' && photo.source !== 'chat' && photo.album !== '聊天') return false;
      if (options.tab === 'all' && photo.hidden) return false;
      if (options.albumFilter !== '全部' && photo.album !== options.albumFilter) return false;
      return true;
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function groupGalleryPhotosByDate(
  photos: GalleryPhoto[],
  formatDateLabel: (time: number) => string,
) {
  return photos.reduce<Array<{ day: string; photos: GalleryPhoto[] }>>((groups, photo) => {
    const day = formatDateLabel(photo.createdAt);
    const latest = groups.at(-1);
    if (latest?.day === day) latest.photos.push(photo);
    else groups.push({ day, photos: [photo] });
    return groups;
  }, []);
}

export function normalizeGalleryTag(tag: string) {
  return tag.trim();
}

export function toggleGalleryTag(tags: string[], tag: string) {
  const normalized = normalizeGalleryTag(tag);
  if (!normalized) return tags;
  return tags.includes(normalized)
    ? tags.filter((item) => item !== normalized)
    : [...tags, normalized];
}

export function buildGalleryPhotoDraft({
  url,
  source,
  title = '新照片',
  createdAt = Date.now(),
}: {
  url: string;
  source: GalleryPhotoSource;
  title?: string;
  createdAt?: number;
}): Omit<GalleryPhoto, 'id'> {
  return {
    url,
    title,
    album: source === 'wechat' || source === 'chat' ? '聊天' : '生活',
    description: '',
    note: '',
    tags: source === 'wechat' || source === 'chat' ? ['微信'] : source === 'generated' ? ['AI生图'] : [],
    characterId: '',
    readableByChar: true,
    reviews: [],
    source,
    favorite: false,
    hidden: false,
    createdAt,
    updatedAt: Date.now(),
  };
}

export function buildGalleryReviewContent({
  photo,
  character,
  draft,
}: {
  photo: GalleryPhoto;
  character?: Pick<Character, 'name'>;
  draft: string;
}) {
  const content = draft.trim();
  if (content) return content;
  const subject = photo.description || photo.note || photo.tags.join('、') || photo.title;
  return character ? `${character.name}看了这张照片：${subject}。` : `这张照片的线索是：${subject}。`;
}

export function buildGalleryHiddenUpdate(photo: GalleryPhoto): Pick<GalleryPhoto, 'hidden' | 'album'> {
  return {
    hidden: !photo.hidden,
    album: photo.hidden ? '生活' : '隐藏',
  };
}
