import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  Music,
  Search,
  Smartphone,
} from 'lucide-react';
import type { Key, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../../store';
import { Avatar, Empty, Header, Panel } from '../shared/AppPrimitives';
import { buildPeekViewModel, getPeekSection, type PeekDetailItem, type PeekSection, type PeekSectionId } from '../peek/peekLogic';

const sectionIcons: Record<PeekSectionId, ReactNode> = {
  chats: <MessageCircle />,
  diaries: <BookOpen />,
  gallery: <ImageIcon />,
  calendar: <CalendarDays />,
  memos: <FileText />,
  browser: <Search />,
  xiaohongshu: <Smartphone />,
  music: <Music />,
};

function DetailCard({ item, sectionId }: { key?: Key; item: PeekDetailItem; sectionId: PeekSectionId }) {
  if (sectionId === 'gallery') {
    return (
      <article className="overflow-hidden rounded-[18px] border-[3px] border-[#111] bg-white shadow-[3px_4px_0_rgba(0,0,0,0.16)]">
        {item.imageUrl ? (
          <img src={item.imageUrl} className="h-36 w-full object-cover" />
        ) : (
          <div className="flex h-36 items-center justify-center bg-[#e9c4d5]">
            <ImageIcon className="h-10 w-10 opacity-60" />
          </div>
        )}
        <div className="p-3">
          <p className="truncate text-sm font-black">{item.title}</p>
          {item.subtitle && <p className="truncate text-xs font-bold opacity-55">{item.subtitle}</p>}
          <p className="mt-2 line-clamp-3 text-xs font-bold leading-5 opacity-75">{item.body}</p>
        </div>
      </article>
    );
  }

  if (sectionId === 'chats') {
    return (
      <article className="rounded-[18px] border-[3px] border-[#111] bg-[#f8f1df] p-4 shadow-[3px_4px_0_rgba(0,0,0,0.14)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-black">{item.title}</p>
            {item.subtitle && <p className="truncate text-xs font-bold opacity-55">{item.subtitle}</p>}
          </div>
          {item.generated && <span className="app-chip text-xs">生成</span>}
        </div>
        <div className="space-y-2">
          {item.body.split('\n').map((line, index) => (
            <p key={`${item.id}-${index}`} className="w-fit max-w-[86%] rounded-2xl border-[2px] border-[#111]/15 bg-white px-3 py-2 text-sm font-bold leading-5">
              {line}
            </p>
          ))}
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-[18px] border-[3px] border-[#111] bg-white/80 p-4 shadow-[3px_4px_0_rgba(0,0,0,0.14)]">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-lg font-black leading-6">{item.title}</p>
          {item.subtitle && <p className="mt-1 text-xs font-bold opacity-55">{item.subtitle}</p>}
        </div>
        {item.generated && <span className="app-chip shrink-0 text-xs">生成</span>}
      </div>
      <p className="whitespace-pre-wrap text-sm font-bold leading-6 opacity-75">{item.body}</p>
      {item.meta && <p className="mt-3 rounded-full bg-[#111]/5 px-3 py-1 text-xs font-black opacity-60">{item.meta}</p>}
    </article>
  );
}

function SectionHomeRow({ section, onOpen }: { key?: Key; section: PeekSection; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="grid w-full grid-cols-[44px_1fr_24px] items-center gap-3 border-b-[2px] border-[#111]/15 py-3 text-left last:border-b-0">
      <div className="app-chip">
        {sectionIcons[section.id] || <CircleUserRound className="h-5 w-5" />}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-lg font-black">{section.title}</p>
          {section.generated && <span className="rounded-full bg-[#111]/10 px-2 py-0.5 text-[10px] font-black">生成</span>}
        </div>
        <p className="line-clamp-2 text-sm font-bold opacity-60">{section.description}</p>
      </div>
      <ChevronRight className="h-5 w-5 opacity-60" />
    </button>
  );
}

function SectionDetail({ section }: { section: PeekSection }) {
  return (
    <>
      <Panel>
        <div className="flex items-center gap-3">
          <div className="app-chip">{sectionIcons[section.id]}</div>
          <div className="min-w-0">
            <h2 className="text-xl font-black">{section.title}</h2>
            <p className="text-xs font-bold opacity-55">{section.generated ? '角色手机生成痕迹' : `${section.count} 条角色手机记录`}</p>
          </div>
        </div>
        <p className="mt-3 text-sm font-bold leading-6 opacity-65">{section.description}</p>
      </Panel>

      <div className={section.id === 'gallery' ? 'mx-4 mt-4 grid grid-cols-2 gap-3' : 'mx-4 mt-4 grid gap-3'}>
        {section.items.map((item) => (
          <DetailCard key={item.id} item={item} sectionId={section.id} />
        ))}
      </div>
    </>
  );
}

export function PeekScreen() {
  const {
    characters,
    chatSessions,
    diaries,
    memos,
    calendarEvents,
    galleryPhotos,
    browserSearches,
    browserBookmarks,
    browserHistory,
    xiaohongshuNotes,
    musicTracks,
    musicListenRecords,
  } = useAppStore();
  const [selectedCharacterId, setSelectedCharacterId] = useState(characters[0]?.id || '');
  const [activeSectionId, setActiveSectionId] = useState<PeekSectionId | null>(null);

  useEffect(() => {
    if (!characters.length) {
      setSelectedCharacterId('');
      setActiveSectionId(null);
      return;
    }
    if (!selectedCharacterId || !characters.some((character) => character.id === selectedCharacterId)) {
      setSelectedCharacterId(characters[0].id);
      setActiveSectionId(null);
    }
  }, [characters, selectedCharacterId]);

  const view = useMemo(
    () => buildPeekViewModel({
      characters,
      chatSessions,
      diaries,
      memos,
      calendarEvents,
      galleryPhotos,
      browserSearches,
      browserBookmarks,
      browserHistory,
      xiaohongshuNotes,
      musicTracks,
      musicListenRecords,
      selectedCharacterId,
    }),
    [
      characters,
      chatSessions,
      diaries,
      memos,
      calendarEvents,
      galleryPhotos,
      browserSearches,
      browserBookmarks,
      browserHistory,
      xiaohongshuNotes,
      musicTracks,
      musicListenRecords,
      selectedCharacterId,
    ],
  );

  const activeSection = activeSectionId ? getPeekSection(view, activeSectionId) : null;

  return (
    <section className="h-full overflow-y-auto pb-8">
      <Header
        title={activeSection ? activeSection.title : '查手机'}
        subtitle={view.selectedCharacter ? `${view.selectedCharacter.name} 的手机` : '查看角色自己的手机'}
        onBack={activeSection ? () => setActiveSectionId(null) : undefined}
      />

      {characters.length > 0 && !activeSection && (
        <div className="no-scrollbar mx-4 mt-4 flex gap-2 overflow-x-auto">
          {characters.map((character) => {
            const active = character.id === view.selectedCharacter?.id;
            return (
              <button
                key={character.id}
                type="button"
                onClick={() => {
                  setSelectedCharacterId(character.id);
                  setActiveSectionId(null);
                }}
                className={`flex shrink-0 items-center gap-2 rounded-full border-[2px] border-[#111] px-3 py-2 text-sm font-black shadow-[2px_3px_0_rgba(0,0,0,0.12)] ${active ? 'bg-[#dceecd]' : 'bg-white/75'}`}
              >
                <Avatar character={character} />
                <span className="max-w-24 truncate">{character.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {activeSection ? (
        <SectionDetail section={activeSection} />
      ) : (
        <Panel>
          {characters.length === 0 ? (
            <Empty text="还没有角色。导入角色后，这里会生成 TA 自己手机里的聊天、日记、相册和其他痕迹。" />
          ) : (
            view.sections.map((section) => (
              <SectionHomeRow key={section.id} section={section} onOpen={() => setActiveSectionId(section.id)} />
            ))
          )}
        </Panel>
      )}
    </section>
  );
}
