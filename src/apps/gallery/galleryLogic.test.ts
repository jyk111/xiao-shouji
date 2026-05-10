import { strict as assert } from 'node:assert';
import type { Character, GalleryPhoto } from '../../store';
import {
  buildGalleryPhotoDraft,
  buildGalleryReviewContent,
  filterGalleryPhotos,
  groupGalleryPhotosByDate,
  normalizeGalleryTag,
  toggleGalleryTag,
} from './galleryLogic';

const photos: GalleryPhoto[] = [
  {
    id: 'hidden',
    url: 'hidden.png',
    title: '隐藏照片',
    album: '隐藏',
    tags: ['秘密'],
    createdAt: new Date('2026-05-08T09:00:00').getTime(),
    updatedAt: 1,
    source: 'upload',
    hidden: true,
    favorite: true,
    readableByChar: false,
    reviews: [],
  },
  {
    id: 'wechat',
    url: 'wechat.png',
    title: '微信照片',
    album: '聊天',
    tags: ['微信'],
    createdAt: new Date('2026-05-10T12:00:00').getTime(),
    updatedAt: 1,
    source: 'wechat',
    hidden: false,
    favorite: false,
    readableByChar: true,
    reviews: [],
  },
  {
    id: 'daily',
    url: 'daily.png',
    title: '日常照片',
    album: '生活',
    tags: ['日常'],
    createdAt: new Date('2026-05-10T08:00:00').getTime(),
    updatedAt: 1,
    source: 'upload',
    hidden: false,
    favorite: true,
    readableByChar: true,
    reviews: [],
  },
];

const allVisible = filterGalleryPhotos(photos, { tab: 'all', albumFilter: '全部' });
assert.deepEqual(allVisible.map((photo) => photo.id), ['wechat', 'daily']);

const favorites = filterGalleryPhotos(photos, { tab: 'favorites', albumFilter: '全部' });
assert.deepEqual(favorites.map((photo) => photo.id), ['daily', 'hidden']);

const wechatOnly = filterGalleryPhotos(photos, { tab: 'wechat', albumFilter: '全部' });
assert.deepEqual(wechatOnly.map((photo) => photo.id), ['wechat']);

const lifeOnly = filterGalleryPhotos(photos, { tab: 'all', albumFilter: '生活' });
assert.deepEqual(lifeOnly.map((photo) => photo.id), ['daily']);

const grouped = groupGalleryPhotosByDate(allVisible, (time) => {
  const date = new Date(time);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
});
assert.equal(grouped.length, 1);
assert.equal(grouped[0].day, '5月10日');
assert.deepEqual(grouped[0].photos.map((photo) => photo.id), ['wechat', 'daily']);

assert.equal(normalizeGalleryTag('  旅行  '), '旅行');
assert.deepEqual(toggleGalleryTag(['日常'], '旅行'), ['日常', '旅行']);
assert.deepEqual(toggleGalleryTag(['日常', '旅行'], '旅行'), ['日常']);

const imported = buildGalleryPhotoDraft({
  url: 'wechat.png',
  source: 'wechat',
  title: '微信照片',
  createdAt: 1770000000000,
});
assert.equal(imported.album, '聊天');
assert.deepEqual(imported.tags, ['微信']);
assert.equal(imported.readableByChar, true);
assert.equal(imported.hidden, false);

const character: Character = {
  id: 'char-1',
  name: '林秋',
  avatar: '',
  description: '',
  personality: '',
  firstMessage: '',
  systemPrompt: '',
};
assert.equal(
  buildGalleryReviewContent({
    photo: photos[2],
    character,
    draft: '',
  }),
  '林秋看了这张照片：日常。',
);
assert.equal(
  buildGalleryReviewContent({
    photo: photos[2],
    draft: '想看这张照片的光线',
  }),
  '想看这张照片的光线',
);

console.log('gallery logic ok');
