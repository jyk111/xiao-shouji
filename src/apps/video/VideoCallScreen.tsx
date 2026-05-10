import { Camera, Mic, Phone, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { Header, Panel, CallButton } from '../shared/AppPrimitives';

export function VideoCallScreen() {
  const [scene, setScene] = useState('画面里他坐在床边，房间只开了一盏小灯，镜头偶尔晃一下。');
  return (
    <section className="h-full overflow-y-auto pb-8">
      <Header title="视频通话" subtitle="描述画面，再用文字假装正在说话" />
      <div className="mx-4 mt-4 overflow-hidden rounded-[28px] border-[3px] border-[#111] bg-black shadow-[3px_3px_0_#111]">
        <div className="flex aspect-[9/13] items-center justify-center bg-gradient-to-br from-[#201b2f] via-[#313b4f] to-[#111] p-6 text-center text-white">
          <p className="text-lg font-bold leading-relaxed">{scene}</p>
        </div>
      </div>
      <Panel>
        <textarea value={scene} onChange={(event) => setScene(event.target.value)} className="hand-input min-h-24 w-full" />
        <div className="mt-4 grid grid-cols-4 gap-2">
          <CallButton icon={<Mic />} label="麦克" />
          <CallButton icon={<Camera />} label="镜头" />
          <CallButton icon={<Sparkles />} label="画面" />
          <CallButton icon={<Phone />} label="挂断" danger />
        </div>
      </Panel>
    </section>
  );
}
