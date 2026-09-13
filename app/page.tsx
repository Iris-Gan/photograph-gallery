"use client";

import { PointerEvent, WheelEvent as ReactWheelEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Photo = {
  id: number;
  title: string;
  src: string;
  column: "left" | "right";
  group: number;
};

type Intro = {
  nameCn: string;
  nameEn: string;
  bioCn: string;
  bioEn: string;
  email: string;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const assetPath = (path: string) => `${basePath}${path}`;

// Ordered from 作品清单.numbers. Column placement is curated to keep both
// waterfall columns visually balanced while preserving the listed sequence.
const starterPhotos: Photo[] = [
  { id: 1, title: "On the way", src: "/photos/On the way.jpg", column: "left", group: 1 },
  { id: 2, title: "IMG 2670", src: "/photos/IMG_2670.JPG", column: "right", group: 1 },
  { id: 3, title: "DSC04591", src: "/photos/DSC04591.JPG", column: "right", group: 2 },
  { id: 4, title: "江城", src: "/photos/江城.jpg", column: "left", group: 2 },
  { id: 5, title: "Kyoto Station", src: "/photos/kyoto-station.jpg", column: "right", group: 3 },
  { id: 6, title: "7f3ead10809a1f2c423fc0333c6ad55", src: "/photos/7f3ead10809a1f2c423fc0333c6ad55.jpg", column: "left", group: 3 },
  { id: 7, title: "Edge of the city", src: "/photos/Edge of the city.png", column: "right", group: 4 },
  { id: 8, title: "DSC01221", src: "/photos/DSC01221.jpg", column: "right", group: 5 },
  { id: 9, title: "当时的月亮", src: "/photos/当时的月亮.jpg", column: "left", group: 5 },
  { id: 10, title: "Barbican", src: "/photos/Barbican.jpg", column: "left", group: 6 },
  { id: 11, title: "窗里窗外", src: "/photos/窗里窗外.jpg", column: "right", group: 7 },
  { id: 12, title: "Berlin Museum Island", src: "/photos/berlin-museumisland.jpg", column: "left", group: 7 },
  { id: 13, title: "DSC02780", src: "/photos/DSC02780.jpg", column: "right", group: 8 },
  { id: 14, title: "Amen Corner", src: "/photos/Amen corner.jpg", column: "left", group: 9 },
  { id: 15, title: "Yunnan", src: "/photos/yunnan.JPG", column: "right", group: 9 },
  { id: 16, title: "Berlin, still turning", src: "/photos/Berlin，still turning.jpg", column: "left", group: 10 },
];

const starterIntro: Intro = {
  nameCn: "甘浩霖",
  nameEn: "Haolin Gan",
  bioCn: "毕业于伦敦政治经济学院人类学系，重庆人，现居上海，目前从事公关工作。",
  bioEn: "I’m from Chongqing and currently based in Shanghai. I studied Anthropology at the London School of Economics and now work in public relations.",
  email: "ganhaolin2022@163.com",
};

export default function Home() {
  const [view, setView] = useState<"home" | "works">("home");
  const [workPage, setWorkPage] = useState(0);
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [editor, setEditor] = useState<"intro" | "wall" | null>(null);
  const [intro, setIntro] = useState<Intro>(starterIntro);
  const [photos, setPhotos] = useState<Photo[]>(starterPhotos);
  const fadeTimer = useRef<number | null>(null);
  const dragStart = useRef<number | null>(null);
  const wheelLocked = useRef(false);
  const wheelTimer = useRef<number | null>(null);

  const nextPhoto = useCallback(() => {
    if (photos.length < 2) return;
    setPrevious(active);
    setActive((active + 1) % photos.length);
    if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    fadeTimer.current = window.setTimeout(() => setPrevious(null), 2400);
  }, [active, photos.length]);

  const groups = useMemo(() => Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    photos: photos.filter((photo) => photo.group === index + 1),
  })).filter((group) => group.photos.length), [photos]);

  useEffect(() => {
    const savedIntro = localStorage.getItem("gallery-demo-intro-v2");
    const savedPhotos = localStorage.getItem("gallery-demo-photos-v4");
    if (savedIntro) setIntro(JSON.parse(savedIntro));
    if (savedPhotos) setPhotos(JSON.parse(savedPhotos));
  }, []);

  useEffect(() => {
    if (view !== "home" || editor || photos.length < 2) return;
    const timer = window.setTimeout(nextPhoto, 3000);
    return () => window.clearTimeout(timer);
  }, [active, editor, nextPhoto, photos.length, view]);

  useEffect(() => () => {
    if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    if (wheelTimer.current) window.clearTimeout(wheelTimer.current);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (editor) setEditor(null);
        else if (view === "works") setView("home");
        return;
      }
      if (editor) return;
      if (view === "home" && event.key === "ArrowRight") nextPhoto();
      if (view === "works" && event.key === "ArrowLeft") {
        if (workPage === 0) setView("home");
        else setWorkPage((page) => page - 1);
      }
      if (view === "works" && event.key === "ArrowRight") {
        setWorkPage((page) => Math.min(page + 1, groups.length - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editor, groups.length, nextPhoto, view, workPage]);

  useEffect(() => {
    if (view !== "works") return;
    [workPage - 1, workPage, workPage + 1]
      .filter((index) => index >= 0 && index < groups.length)
      .flatMap((index) => groups[index].photos)
      .forEach((photo) => {
        const image = new window.Image();
        image.src = encodeURI(assetPath(photo.src));
      });
  }, [groups, view, workPage]);

  const saveIntro = (next: Intro) => {
    setIntro(next);
    localStorage.setItem("gallery-demo-intro-v2", JSON.stringify(next));
  };

  const savePhotos = (next: Photo[]) => {
    setPhotos(next);
    setActive((value) => Math.min(value, Math.max(next.length - 1, 0)));
    localStorage.setItem("gallery-demo-photos-v4", JSON.stringify(next));
  };

  const openHome = () => setView("home");
  const openWorks = () => setView("works");
  const changeWorkPage = (target: number) => {
    const next = Math.max(0, Math.min(target, groups.length - 1));
    if (next === workPage) return;
    setWorkPage(next);
  };
  const previousWork = () => {
    if (workPage === 0) openHome();
    else changeWorkPage(workPage - 1);
  };
  const nextWork = () => {
    if (workPage === groups.length - 1) openHome();
    else changeWorkPage(workPage + 1);
  };
  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    dragStart.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    if (dragStart.current === null) return;
    const distance = event.clientX - dragStart.current;
    if (view === "home" && distance > 70) openWorks();
    if (view === "works" && distance < -70) nextWork();
    if (view === "works" && distance > 70) previousWork();
    dragStart.current = null;
  };
  const onWheel = (event: ReactWheelEvent<HTMLElement>) => {
    const horizontal = Math.abs(event.deltaX);
    if (editor || wheelLocked.current || horizontal < 28 || horizontal < Math.abs(event.deltaY) * 1.15) return;
    wheelLocked.current = true;
    if (view === "home") openWorks();
    else if (event.deltaX > 0) nextWork();
    else previousWork();
    wheelTimer.current = window.setTimeout(() => { wheelLocked.current = false; }, 1200);
  };
  const current = photos[active] ?? starterPhotos[0];
  const previousPhoto = previous === null ? null : photos[previous];

  return (
    <main className={`portfolio ${view === "works" ? "is-in-works" : ""}`} onWheel={onWheel}>
      <header className="site-tools">
        {view === "works" ? <button className="home-link" onClick={openHome}>返回主页</button> : <span />}
      </header>

      <section className="home-page" id="home" aria-label="Homepage" aria-hidden={view === "works"} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        <div className="identity-block">
          <p className="identity-name-cn">{intro.nameCn}</p>
          <p className="identity-name-en">{intro.nameEn}</p>
          <p className="identity-bio identity-bio-cn">{intro.bioCn}</p>
          <p className="identity-bio identity-bio-en">{intro.bioEn}</p>
          <p className="identity-contact">Contact: <a href={`mailto:${intro.email}`}>{intro.email}</a></p>
        </div>

        <button className="hero-work" onClick={nextPhoto} aria-label="Show next photograph">
          <span className="hero-frame">
            {previousPhoto && <img className="hero-photo is-previous" src={encodeURI(assetPath(previousPhoto.src))} alt="" aria-hidden="true" />}
            <img key={current.id} className="hero-photo is-current" src={encodeURI(assetPath(current.src))} alt={current.title} />
          </span>
        </button>

        <button
          type="button"
          className="home-next"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          onClick={openWorks}
          aria-label="Swipe right or click to view selected works"
          title="右滑或点击进入作品页"
        >
          <img src={assetPath("/right.png")} alt="" aria-hidden="true" />
        </button>

        <p className="slide-count">{String(active + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</p>
      </section>

      <section className="works-page" id="works" aria-label="Photography works" aria-hidden={view === "home"} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        <div className="works-heading">
          <p>SELECTED WORKS</p>
          <span>2022—2026</span>
        </div>
        <div className="works-track" style={{ transform: `translate3d(-${workPage * 100}%, 0, 0)` }}>
          {groups.map((group, index) => (
            <section
              className={`work-group-page work-group-${group.id} ${group.photos.length === 1 ? "work-group-single" : "work-group-pair"} work-layout-${(index % 4) + 1}`}
              key={group.id}
              aria-label={`Work group ${group.id}`}
              aria-hidden={workPage !== index}
            >
              {group.photos.map((photo) => <WorkPhoto photo={photo} key={photo.id} />)}
            </section>
          ))}
        </div>
        <button
          type="button"
          className="page-arrow page-arrow-left"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          onClick={previousWork}
          aria-label={workPage === 0 ? "Return to homepage" : "Previous work group"}
        >←</button>
        <button
          type="button"
          className="page-arrow page-arrow-right"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          onClick={nextWork}
          aria-label={workPage === groups.length - 1 ? "Return to homepage" : "Next work group"}
        >→</button>
        <p className="work-count">{String(workPage + 1).padStart(2, "0")} / {String(groups.length).padStart(2, "0")}</p>
      </section>

      {editor === "intro" && (
        <IntroEditor value={intro} onClose={() => setEditor(null)} onSave={(value) => { saveIntro(value); setEditor(null); }} />
      )}
      {editor === "wall" && (
        <WallEditor value={photos} onClose={() => setEditor(null)} onSave={(value) => { savePhotos(value); setEditor(null); }} />
      )}

      <div className="orientation-note"><p>PLEASE ROTATE YOUR DEVICE</p><span>请横屏观看</span></div>
    </main>
  );
}

function WorkPhoto({ photo }: { photo: Photo }) {
  return (
    <figure className="masonry-photo">
      <img src={encodeURI(assetPath(photo.src))} alt={photo.title} loading="lazy" decoding="async" />
    </figure>
  );
}

function IntroEditor({ value, onClose, onSave }: { value: Intro; onClose: () => void; onSave: (value: Intro) => void }) {
  const [draft, setDraft] = useState(value);
  return (
    <div className="editor-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="editor-panel" role="dialog" aria-modal="true" aria-labelledby="intro-editor-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="editor-heading"><h2 id="intro-editor-title">Edit information</h2><button onClick={onClose}>Close</button></div>
        <label>中文名<input value={draft.nameCn} onChange={(event) => setDraft({ ...draft, nameCn: event.target.value })} /></label>
        <label>English name<input value={draft.nameEn} onChange={(event) => setDraft({ ...draft, nameEn: event.target.value })} /></label>
        <label>中文介绍<textarea rows={4} value={draft.bioCn} onChange={(event) => setDraft({ ...draft, bioCn: event.target.value })} /></label>
        <label>English introduction<textarea rows={6} value={draft.bioEn} onChange={(event) => setDraft({ ...draft, bioEn: event.target.value })} /></label>
        <label>Email<input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label>
        <button className="save-button" onClick={() => onSave(draft)}>Save locally</button>
      </section>
    </div>
  );
}

function WallEditor({ value, onClose, onSave }: { value: Photo[]; onClose: () => void; onSave: (value: Photo[]) => void }) {
  const [draft, setDraft] = useState(value);
  const move = (index: number, step: number) => {
    const target = index + step;
    if (target < 0 || target >= draft.length) return;
    const next = [...draft];
    [next[index], next[target]] = [next[target], next[index]];
    setDraft(next);
  };

  return (
    <div className="editor-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="editor-panel wall-editor" role="dialog" aria-modal="true" aria-labelledby="wall-editor-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="editor-heading"><h2 id="wall-editor-title">Edit works</h2><button onClick={onClose}>Close</button></div>
        <div className="photo-editor-list">
          {draft.map((photo, index) => (
            <div className="photo-editor-row" key={photo.id}>
              <div className="editor-thumb"><img src={encodeURI(assetPath(photo.src))} alt="" /></div>
              <input aria-label={`Title for photo ${index + 1}`} value={photo.title} onChange={(event) => setDraft(draft.map((item) => item.id === photo.id ? { ...item, title: event.target.value } : item))} />
              <button onClick={() => move(index, -1)} aria-label="Move photo earlier">↑</button>
              <button onClick={() => move(index, 1)} aria-label="Move photo later">↓</button>
              <button onClick={() => setDraft(draft.filter((item) => item.id !== photo.id))} aria-label="Remove photo">×</button>
            </div>
          ))}
        </div>
        <p className="demo-note">照片已依据作品清单分配至左右两列。调整顺序会同步改变首页轮播顺序。</p>
        <button className="save-button" disabled={!draft.length} onClick={() => onSave(draft)}>Save locally</button>
      </section>
    </div>
  );
}
