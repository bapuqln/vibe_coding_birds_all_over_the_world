import { useCallback } from "react";
import { useAppStore } from "../../store";

export function PhotoGalleryPanel() {
  const photoGalleryOpen = useAppStore((s) => s.photoGalleryOpen);
  const setPhotoGalleryOpen = useAppStore((s) => s.setPhotoGalleryOpen);
  const birdPhotos = useAppStore((s) => s.birdPhotos);
  const deletePhoto = useAppStore((s) => s.deletePhoto);
  const language = useAppStore((s) => s.language);

  const handleClose = useCallback(() => setPhotoGalleryOpen(false), [setPhotoGalleryOpen]);

  if (!photoGalleryOpen) return null;

  return (
    <div
      className="pointer-events-auto fixed inset-0 flex items-center justify-center p-5"
      style={{ animation: "panelScaleFade var(--panel-duration) var(--panel-ease)" }}
    >
      <button
        type="button"
        onClick={handleClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-label={language === "zh" ? "关闭" : "Close"}
      />

      <div className="relative max-h-[85vh] w-full max-w-lg overflow-hidden rounded-[20px] bg-white/95 shadow-2xl backdrop-blur-xl">
        <header className="flex items-center justify-between border-b border-sky-100 bg-linear-to-r from-sky-50/80 to-indigo-50/80 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-sky-900">
              {language === "zh" ? "📷 我的鸟类照片" : "📷 My Bird Photos"}
            </h2>
            <p className="text-xs text-sky-600">
              {language === "zh"
                ? `${birdPhotos.length} 张照片`
                : `${birdPhotos.length} photos`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-200/60 text-sky-700 hover:bg-sky-300"
            aria-label={language === "zh" ? "关闭" : "Close"}
          >
            ✕
          </button>
        </header>

        <div className="max-h-[calc(85vh-4rem)] overflow-y-auto overscroll-contain p-4">
          {birdPhotos.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-4xl">📸</p>
              <p className="mt-3 text-sm text-gray-500">
                {language === "zh"
                  ? '还没有拍摄照片。发现鸟类后点击"拍照"按钮！'
                  : 'No photos yet. Discover birds and tap "Take Photo"!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {birdPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                    <div className="aspect-4/3 overflow-hidden">
                    <img
                      src={photo.dataUrl}
                      alt={language === "zh" ? photo.birdNameZh : photo.birdNameEn}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {language === "zh" ? photo.birdNameZh : photo.birdNameEn}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(photo.capturedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deletePhoto(photo.id)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label={language === "zh" ? "删除" : "Delete"}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
