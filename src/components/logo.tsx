import Image from "next/image";
import Link from "next/link";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="MockStride home">
      <Image src="/logo-mark.svg" alt="" width={42} height={42} priority className={inverse ? "brightness-0 invert" : ""} />
      <span className={`text-[1.2rem] font-extrabold tracking-[-0.06em] ${inverse ? "text-white" : "text-navy"}`}>
        Mock<span className={inverse ? "text-lime" : "text-blue"}>Stride</span>
      </span>
    </Link>
  );
}
