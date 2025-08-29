import Link from "next/link";
import Image from "next/image";

export const Logo = () => {
  return (
    <Link href="/" className="flex gap-2 items-center">
      <Image src="/logo.svg" width={36} height={36} alt="Logo" />
      <h1
        className="text-2xl font-bold bg-clip-text select-none"
        style={{
          filter: "drop-shadow(0 0 0 2px white)",
        }}
      >
        Predictum
      </h1>
    </Link>
  );
};
