import { Logo } from "./Logo";
import { CustomConnectButton } from "../web3/CustomConnectButton";
import { MenuDropdown } from "./MenuDropdown";

export function Navigation() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo matching Figma design */}
          <Logo />

          <div className="flex items-center space-x-2 sm:space-x-4">
            <CustomConnectButton />

            {/* Menu icon with dropdown */}
            <MenuDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
}
