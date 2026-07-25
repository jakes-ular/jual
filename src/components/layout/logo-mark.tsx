import Image from "next/image";

export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <Image
      src="/Logo.png"
      alt="ARK DIGITAL"
      width={1254}
      height={1254}
      priority
      className={`${className} object-contain shrink-0`}
    />
  );
}
