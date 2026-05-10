import {
  ChevronLeft,
  CircleUserRound,
  FileText,
  Grid2X2,
  Image as ImageIcon,
  ImagePlus,
  LockKeyhole,
  MessageCircle,
  Plus,
  Star,
  Tag,
  Trash2,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import type { GalleryPhoto } from '../../store';
import { useAppStore } from '../../store';
import { cn } from '../../lib/utils';
import {
  buildGalleryHiddenUpdate,
  buildGalleryPhotoDraft,
  buildGalleryReviewContent,
  filterGalleryPhotos,
  galleryAlbums,
  groupGalleryPhotosByDate,
  normalizeGalleryTag,
  toggleGalleryTag,
  type GalleryAlbumFilter,
  type GalleryTab,
  type GalleryView,
  type GalleryPhotoSource,
} from './galleryLogic';

function Header({
  title,
  subtitle,
  tabs,
  onSave,
  onBack,
  saveLabel = '保存',
}: {
  title: string;
  subtitle?: string;
  tabs?: React.ReactNode;
  onSave?: () => void;
  onBack?: () => void;
  saveLabel?: string;
}) {
  const goBack = useAppStore((state) => state.goBack);
  return (
    <header className="sticky top-0 z-30 bg-[var(--phone-bg)] px-4 pb-4 pt-6">
      <div className="grid grid-cols-[48px_1fr_56px] items-center">
        <button onClick={onBack || goBack} className="circle-button">
          <ChevronLeft className="h-7 w-7" />
        </button>
        <div className="min-w-0 text-center">
          <h1 className="truncate text-2xl font-black">{title}</h1>
          {subtitle && <p className="truncate text-xs font-bold opacity-60">{subtitle}</p>}
        </div>
        {onSave ? <button onClick={onSave} className="save-button">{saveLabel}</button> : <span />}
      </div>
      {tabs && <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">{tabs}</div>}
    </header>
  );
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('hand-panel mx-4 mb-4 p-4', className)}>{children}</div>;
}

type PillProps = { active?: boolean; icon?: React.ReactNode; label: string; onClick: () => void };

const Pill: React.FC<PillProps> = ({ active, icon, label, onClick }) => {
  return (
    <button onClick={onClick} className={cn('pill', active && 'active')}>
      {icon && React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-4 w-4' })}
      {label}
    </button>
  );
};

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 flex items-center gap-2 text-lg font-black">
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-5 w-5' })}
        {label}
      </span>
      {children}
    </label>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl bg-white/60 p-4 text-center text-sm font-black opacity-60">{text}</p>;
}

function formatDateLabel(time: number) {
  const date = new Date(time);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function GalleryScreen() {
  const {
    galleryPhotos,
    galleryTags,
    imageBed,
    wechatPhotos,
    addGalleryPhoto,
    updateGalleryPhoto,
    addGalleryPhotoReview,
    deleteGalleryPhoto,
    toggleGalleryPhotoFavorite,
    addGalleryTag,
    characters,
  } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<GalleryTab>('all');
  const [albumFilter, setAlbumFilter] = useState<GalleryAlbumFilter>('全部');
  const [view, setView] = useState<GalleryView>('grid');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reviewDraft, setReviewDraft] = useState('');
  const [newTag, setNewTag] = useState('');
  const activePhoto = galleryPhotos.find((photo) => photo.id === activeId);
  const visiblePhotos = filterGalleryPhotos(galleryPhotos, { tab, albumFilter });
  const groupedPhotos = groupGalleryPhotosByDate(visiblePhotos, formatDateLabel);

  const addPhotoUrl = (url: string, source: GalleryPhotoSource, title = '新照片', createdAt = Date.now()) => {
    const id = addGalleryPhoto(buildGalleryPhotoDraft({ url, source, title, createdAt }));
    setActiveId(id);
    setView('detail');
  };

  const uploadPhotos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(event.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => addPhotoUrl(reader.result as string, 'upload', file.name.replace(/\.[^.]+$/, '') || '新照片', file.lastModified || Date.now());
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  };

  const importWechatPhoto = (url: string) => {
    const exists = galleryPhotos.some((photo) => photo.url === url);
    if (!exists) addPhotoUrl(url, 'wechat', '微信照片');
  };

  const generatePhotoReview = () => {
    if (!activePhoto) return;
    const character = characters.find((item) => item.id === activePhoto.characterId) || characters[0];
    addGalleryPhotoReview(activePhoto.id, {
      characterId: character?.id,
      content: buildGalleryReviewContent({ photo: activePhoto, character, draft: reviewDraft }),
    });
    setReviewDraft('');
  };

  const togglePhotoTag = (tag: string) => {
    if (!activePhoto) return;
    updateGalleryPhoto(activePhoto.id, { tags: toggleGalleryTag(activePhoto.tags, tag) });
  };

  const createGalleryTag = () => {
    const tag = normalizeGalleryTag(newTag);
    if (!tag) return;
    addGalleryTag(tag);
    if (activePhoto && !activePhoto.tags.includes(tag)) {
      updateGalleryPhoto(activePhoto.id, { tags: [...activePhoto.tags, tag] });
    }
    setNewTag('');
  };

  if (view === 'detail' && activePhoto) {
    return (
      <section className="gallery-screen h-full overflow-y-auto pb-8">
        <Header title="照片" subtitle={formatDateLabel(activePhoto.createdAt)} onBack={() => setView('grid')} />
        <Panel className="overflow-hidden p-0">
          <img src={activePhoto.url} alt={activePhoto.title} className="max-h-[430px] w-full object-cover" />
        </Panel>
        <Panel>
          <Field icon={<ImageIcon />} label="标题">
            <input value={activePhoto.title} onChange={(event) => updateGalleryPhoto(activePhoto.id, { title: event.target.value })} className="hand-input w-full" />
          </Field>
          <Field icon={<Grid2X2 />} label="相簿">
            <select value={activePhoto.album} onChange={(event) => updateGalleryPhoto(activePhoto.id, { album: event.target.value as GalleryPhoto['album'], hidden: event.target.value === '隐藏' })} className="hand-input w-full">
              {galleryAlbums.map((album) => <option key={album} value={album}>{album}</option>)}
            </select>
          </Field>
          <div className="mb-5">
            <span className="mb-2 flex items-center gap-2 text-lg font-black">
              <Tag className="h-5 w-5" />
              标签
            </span>
            <div className="flex flex-wrap gap-2">
              {galleryTags.map((tag) => (
                <button key={tag} onClick={() => togglePhotoTag(tag)} className={cn('pill', activePhoto.tags.includes(tag) && 'active')}>
                  {tag}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input value={newTag} onChange={(event) => setNewTag(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && createGalleryTag()} className="hand-input min-w-0 flex-1" placeholder="新标签" />
              <button onClick={createGalleryTag} className="pill active">
                <Plus className="h-4 w-4" />
                创建
              </button>
            </div>
          </div>
          <Field icon={<CircleUserRound />} label="给谁看">
            <select value={activePhoto.characterId || ''} onChange={(event) => updateGalleryPhoto(activePhoto.id, { characterId: event.target.value })} className="hand-input w-full">
              <option value="">所有 char</option>
              {characters.map((character) => <option key={character.id} value={character.id}>{character.name}</option>)}
            </select>
          </Field>
          <Field icon={<FileText />} label="备注">
            <textarea value={activePhoto.description || ''} onChange={(event) => updateGalleryPhoto(activePhoto.id, { description: event.target.value })} className="hand-input min-h-[72px] w-full resize-none" placeholder="可选，补一句照片说明" />
          </Field>
          <Field icon={<MessageCircle />} label="评价提示">
            <textarea value={reviewDraft} onChange={(event) => setReviewDraft(event.target.value)} className="hand-input min-h-[76px] w-full resize-none" placeholder="可选：想让 char 从什么角度评价" />
          </Field>
          <button onClick={generatePhotoReview} className="fetch-button mb-4">
            <MessageCircle className="h-5 w-5" />
            让 char 评价这张照片
          </button>
          {(activePhoto.reviews || []).length > 0 && (
            <div className="mb-4 rounded-2xl bg-white/70 p-3">
              <p className="text-sm font-black opacity-60">char 评价</p>
              {(activePhoto.reviews || []).map((review) => {
                const character = characters.find((item) => item.id === review.characterId);
                return (
                  <p key={`${review.createdAt}-${review.content}`} className="mt-2 text-sm font-bold leading-6">
                    {character ? `${character.name}：` : ''}{review.content}
                  </p>
                );
              })}
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => toggleGalleryPhotoFavorite(activePhoto.id)} className={cn('fetch-button', activePhoto.favorite && 'bg-[#fff0b8]')}>
              <Star className={cn('h-5 w-5', activePhoto.favorite && 'fill-[#111]')} />
            </button>
            <button onClick={() => updateGalleryPhoto(activePhoto.id, { readableByChar: !activePhoto.readableByChar })} className={cn('fetch-button', activePhoto.readableByChar && 'bg-[#dceecd]')}>
              <CircleUserRound className="h-5 w-5" />
            </button>
            <button onClick={() => updateGalleryPhoto(activePhoto.id, buildGalleryHiddenUpdate(activePhoto))} className="fetch-button">
              <LockKeyhole className="h-5 w-5" />
            </button>
          </div>
          <button onClick={() => { deleteGalleryPhoto(activePhoto.id); setActiveId(null); setView('grid'); }} className="fetch-button mt-3 bg-[#ffd6d6]">
            <Trash2 className="h-5 w-5" />
          </button>
        </Panel>
      </section>
    );
  }

  return (
    <section className="gallery-screen h-full overflow-y-auto pb-8">
      <Header
        title="相册"
        subtitle="按日期整理照片，点选标签"
        onSave={() => inputRef.current?.click()}
        saveLabel="上传"
        tabs={
          <>
            <Pill active={tab === 'all'} icon={<ImageIcon />} label="全部" onClick={() => setTab('all')} />
            <Pill active={tab === 'favorites'} icon={<Star />} label="收藏" onClick={() => setTab('favorites')} />
            <Pill active={tab === 'hidden'} icon={<LockKeyhole />} label="隐藏" onClick={() => setTab('hidden')} />
            <Pill active={tab === 'wechat'} icon={<MessageCircle />} label="微信" onClick={() => setTab('wechat')} />
          </>
        }
      />
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={uploadPhotos} className="hidden" />
      <Panel>
        <button onClick={() => inputRef.current?.click()} className="fetch-button">
          <ImagePlus className="h-5 w-5" />
          上传照片
        </button>
        <p className="mt-3 text-sm font-bold leading-6 opacity-65">照片会自动记录日期。上传后点进照片，像现实相册一样点选标签，也可以创建新标签。</p>
      </Panel>
      <Panel>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Pill active={albumFilter === '全部'} icon={<Grid2X2 />} label="全部相簿" onClick={() => setAlbumFilter('全部')} />
          {galleryAlbums.map((album) => (
            <Pill key={album} active={albumFilter === album} icon={album === '隐藏' ? <LockKeyhole /> : <ImageIcon />} label={album} onClick={() => setAlbumFilter(album)} />
          ))}
        </div>
      </Panel>
      <Panel className="p-4">
        {visiblePhotos.length > 0 ? (
          <div className="grid gap-4">
            {groupedPhotos.map((group) => (
              <div key={group.day}>
                <p className="mb-2 text-sm font-black opacity-60">{group.day}</p>
                <div className="grid grid-cols-3 gap-2">
                  {group.photos.map((photo) => (
                    <button key={photo.id} onClick={() => { setActiveId(photo.id); setView('detail'); }} className="relative aspect-square overflow-hidden rounded-[18px] border-[3px] border-[#111] bg-white">
                      <img src={photo.url} alt={photo.title} className="h-full w-full object-cover" />
                      {photo.favorite && <Star className="absolute right-1 top-1 h-4 w-4 fill-[#fff0b8] text-[#111]" />}
                      {photo.hidden && <LockKeyhole className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-white p-0.5 text-[#111]" />}
                      {photo.readableByChar && <MessageCircle className="absolute bottom-1 left-1 h-4 w-4 rounded-full bg-white p-0.5 text-[#111]" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="这里还没有照片。" />
        )}
      </Panel>
      {(imageBed || wechatPhotos.length > 0) && (
        <Panel>
          <p className="text-lg font-black">可导入</p>
          {imageBed && (
            <button onClick={() => addPhotoUrl(imageBed, 'image-bed', '图床照片')} className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-white/70 p-3 text-left">
              <img src={imageBed} alt="图床照片" className="h-14 w-14 rounded-2xl object-cover" />
              <span className="text-sm font-black">导入图床照片，继续点选标签</span>
            </button>
          )}
          {wechatPhotos.slice(0, 6).map((url) => (
            <button key={url} onClick={() => importWechatPhoto(url)} className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-white/70 p-3 text-left">
              <img src={url} alt="微信照片" className="h-14 w-14 rounded-2xl object-cover" />
              <span className="text-sm font-black">导入微信照片墙，继续点选标签</span>
            </button>
          ))}
        </Panel>
      )}
    </section>
  );
}
