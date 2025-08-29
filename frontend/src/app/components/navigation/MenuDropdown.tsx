"use client";

import { UserIcon, FileTextIcon, CheckCircle2Icon, LogOutIcon, DropletsIcon } from "lucide-react";
import { useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

export const MenuDropdown = () => {
  const { disconnect } = useDisconnect();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center space-x-1 sm:space-x-2 bg-dark-800/50 border border-dark-700 rounded-full px-2 py-1.5 sm:px-3 sm:py-2 hover:bg-dark-700/50 transition-all duration-200 transform hover:scale-105">
        <div className="p-0.5 sm:p-1 relative">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Top line */}
            <path
              d="M9.27344 18V16.5H21.2734V18H9.27344Z"
              fill="white"
              className="transition-all duration-300 ease-out group-data-[state=open]:translate-x-2 group-data-[state=open]:opacity-50 group-data-[state=closed]:translate-x-0 group-data-[state=closed]:opacity-100"
            />
            {/* Middle line */}
            <path
              d="M9.27344 12.75V11.25H21.2734V12.75H9.27344Z"
              fill="white"
              className="transition-all duration-300 ease-out group-data-[state=open]:scale-x-75 group-data-[state=open]:opacity-75 group-data-[state=closed]:scale-x-100 group-data-[state=closed]:opacity-100"
            />
            {/* Bottom line */}
            <path
              d="M3.27344 7.5V6H21.2734V7.5H3.27344Z"
              fill="white"
              className="transition-all duration-300 ease-out group-data-[state=open]:-translate-x-2 group-data-[state=open]:opacity-50 group-data-[state=closed]:translate-x-0 group-data-[state=closed]:opacity-100"
            />
          </svg>
        </div>
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-data-[state=open]:rotate-180"
          viewBox="0 0 25 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.2734 22C10.9068 22 9.61509 21.7375 8.39844 21.2125C7.18179 20.6875 6.11929 19.9708 5.21094 19.0625C4.3026 18.1542 3.58594 17.0917 3.06094 15.875C2.53594 14.6583 2.27344 13.3666 2.27344 12C2.27344 10.6166 2.53594 9.31665 3.06094 8.1C3.58594 6.88335 4.3026 5.825 5.21094 4.925C6.11929 4.025 7.18179 3.3125 8.39844 2.7875C9.61509 2.2625 10.9068 2 12.2734 2C13.6568 2 14.9568 2.2625 16.1734 2.7875C17.3901 3.3125 18.4484 4.025 19.3484 4.925C20.2484 5.825 20.9609 6.88335 21.4859 8.1C22.0109 9.31665 22.2734 10.6166 22.2734 12C22.2734 13.3666 22.0109 14.6583 21.4859 15.875C20.9609 17.0917 20.2484 18.1542 19.3484 19.0625C18.4484 19.9708 17.3901 20.6875 16.1734 21.2125C14.9568 21.7375 13.6568 22 12.2734 22ZM12.2722 3.5C10.2397 3.5 8.45679 4.12916 6.92344 5.3875C5.39009 6.64585 4.40677 8.23335 3.97344 10.15H5.94844L8.14844 6.25H16.4234L18.6234 10.15H20.5734C20.1401 8.23335 19.1609 6.64585 17.6359 5.3875C16.1109 4.12916 14.323 3.5 12.2722 3.5ZM12.2669 20.5C14.6379 20.5 16.6484 19.6709 18.2984 18.0125C19.9484 16.3542 20.7734 14.35 20.7734 12V11.65H17.7484L15.5484 7.75H9.02344L6.82344 11.65H3.77344V12C3.77344 14.35 4.60069 16.3542 6.25519 18.0125C7.90954 19.6709 9.91344 20.5 12.2669 20.5ZM9.11769 14.425C8.73819 14.425 8.41929 14.2939 8.16094 14.0317C7.90259 13.7697 7.77344 13.4489 7.77344 13.0693C7.77344 12.6898 7.90454 12.3709 8.16669 12.1125C8.42869 11.8542 8.74954 11.725 9.12919 11.725C9.50869 11.725 9.82759 11.8561 10.0859 12.1182C10.3443 12.3802 10.4734 12.7011 10.4734 13.0808C10.4734 13.4603 10.3423 13.7792 10.0802 14.0375C9.81819 14.2959 9.49734 14.425 9.11769 14.425ZM15.4427 14.425C15.0632 14.425 14.7443 14.2939 14.4859 14.0317C14.2276 13.7697 14.0984 13.4489 14.0984 13.0693C14.0984 12.6898 14.2295 12.3709 14.4917 12.1125C14.7537 11.8542 15.0745 11.725 15.4542 11.725C15.8337 11.725 16.1526 11.8561 16.4109 12.1182C16.6693 12.3802 16.7984 12.7011 16.7984 13.0808C16.7984 13.4603 16.6673 13.7792 16.4052 14.0375C16.1432 14.2959 15.8223 14.425 15.4427 14.425Z"
            fill="white"
          />
        </svg>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-dark-800 border border-dark-700 shadow-2xl text-white py-3 px-4 w-64 space-y-2"
        side={"bottom"}
        align={"end"}
      >
        <DropdownMenuItem
          className="cursor-pointer text-base focus:text-white focus:bg-dark-700"
          onClick={() => router.push("/profile")}
        >
          <UserIcon /> <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-base focus:text-white focus:bg-dark-700"
          onClick={() => router.push("/faucet")}
        >
          <DropletsIcon /> <span>USDC Faucet</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-base focus:text-white focus:bg-dark-700"
          onClick={() => window.open("https://docs.predictum.xyz/", "_blank")}
        >
          <FileTextIcon /> <span>Documentation</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer text-base focus:text-white focus:bg-dark-700">
          <CheckCircle2Icon /> <span>Terms of Use</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-dark-600" />
        <DropdownMenuItem
          className="cursor-pointer text-base focus:text-red-400 focus:bg-dark-700 text-red-400"
          onClick={() => disconnect()}
        >
          <LogOutIcon /> <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
