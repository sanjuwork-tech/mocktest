import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="brand-logo" aria-label="TestDisha home">
      <Image
        src="/logo.svg"
        alt="TestDisha"
        width={205}
        height={43}
        priority
      />
    </Link>
  );
}
