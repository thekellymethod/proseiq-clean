"use client";

type MediaItem = {
  url?: string;
  type?: string;
  alt?: string;
  title?: string;
  embed?: string;
};

export function MediaBlock({ media }: { media: MediaItem }) {
  const type = (media.type ?? "image").toLowerCase();
  const url = media.url ?? media.embed;

  if (!url) return null;

  switch (type) {
    case "video":
    case "youtube":
    case "vimeo":
      const embedUrl =
        type === "youtube" && !url.includes("embed")
          ? `https://www.youtube.com/embed/${url.split("/").pop()?.replace("watch?v=", "")}`
          : type === "vimeo" && !url.includes("player")
            ? `https://player.vimeo.com/video/${url.split("/").pop()}`
            : url;
      return (
        <figure className="my-6">
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/10">
            <iframe
              src={embedUrl}
              title={media.alt ?? media.title ?? "Embedded media"}
              className="h-full w-full"
              allowFullScreen
            />
          </div>
          {(media.alt || media.title) && (
            <figcaption className="mt-2 text-sm text-white/60">
              {media.alt ?? media.title}
            </figcaption>
          )}
        </figure>
      );

    case "pdf":
      return (
        <figure className="my-6">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-white/10 bg-white/5 p-4 text-amber-300 hover:bg-white/10"
          >
            📄 {media.alt ?? media.title ?? "View PDF"}
          </a>
        </figure>
      );

    case "image":
    default:
      return (
        <figure className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={media.alt ?? media.title ?? ""}
            className="max-w-full rounded-lg border border-white/10"
          />
          {(media.alt || media.title) && (
            <figcaption className="mt-2 text-sm text-white/60">
              {media.alt ?? media.title}
            </figcaption>
          )}
        </figure>
      );
  }
}
