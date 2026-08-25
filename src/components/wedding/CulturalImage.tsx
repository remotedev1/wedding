import { wedding } from "@/data/wedding";

export function KodavaSymbol({
  className = "",
  alt = "Kodava symbol"
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <img
      className={className}
      src={wedding.assets.kodavaSymbol}
      alt={alt}
      loading="eager"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}

export function ThumBolicha({
  className = ""
}: {
  className?: string;
}) {
  return (
    <img
      className={className}
      src={wedding.assets.thumBolicha}
      alt="Thum Bolicha"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}
