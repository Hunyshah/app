"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
// Pruned HeroUI; keeping minimal elements
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";

import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "./uiPrimitives";

import { selectIsAuthenticated } from "@/components/Redux/Slices/AuthSlice";
import { logout } from "@/components/Redux/Slices/AuthSlice";
import {
  BsMoonStarsFill,
  FaUser,
  IoMdSettings,
  IoMdSunny,
  MdOutlineLogout,
} from "@/public/assets/icons";

export default function TopSection({ page }) {
  const { theme, setTheme } = useTheme();
  const isLogin = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 639 });

  const handleNavigateBack = () => {
    router.back();
  };

  // Detect scroll to enhance blur effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <>
      <div
        className={`
        fixed top-0 left-0 sm:left-64 right-0 z-30
        w-auto sm:w-[calc(100%-16rem)]
        p-4 
        backdrop-blur-md backdrop-saturate-150
        shadow-medium
        ${isScrolled ? " shadow-lg" : ""}
        border-b border-gray-200/30 dark:border-brand-muted/30
        flex items-center justify-between
        transition-all duration-300 ease-out
        bg-brand-white/90 dark:bg-brand-deepdark/90
      `}
      >
        <h1 className="text-xl poppins_semibold dark:text-brand-white text-brand-black flex items-center justify-start gap-3">
          {page}
        </h1>

        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            aria-label="Toggle theme"
            className="text-default-500 hover:text-foreground backdrop-blur-sm"
            variant="light"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <IoMdSunny size={20} />
            ) : (
              <BsMoonStarsFill size={20} />
            )}
          </Button>

          {!isLogin ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex">
                <Link
                  className="px-3 py-2 text-brand-black dark:text-brand-white hover:text-brand-primary transition-colors"
                  href="/login"
                >
                  Login
                </Link>
              </div>
              <Button
                as={Link}
                className="bg-brand-primary hover:bg-brand-primary/80 text-brand-white backdrop-blur-sm"
                href="/signup"
                variant="flat"
              >
                Sign Up
              </Button>
            </div>
          ) : (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform ring-2 ring-white/20 backdrop-blur-sm"
                  color="secondary"
                  name="Jason Hughes"
                  size="sm"
                  src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                />
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Profile Actions"
                className="backdrop-blur-md bg-white/80 dark:bg-brand-deepdark/80"
                variant="flat"
              >
                <DropdownItem
                  key="profile"
                  className="h-14 gap-2"
                  startContent={<FaUser size={17} />}
                >
                  <p className="roboto_medium">Signed in as</p>
                  <p className="roboto_medium">zoey@example.com</p>
                </DropdownItem>
                {!isMobile && (
                  <DropdownItem
                    key="settings"
                    className="gap-2"
                    startContent={<IoMdSettings size={17} />}
                    onClick={() => router.push("/settings")}
                  >
                    Settings
                  </DropdownItem>
                )}
                <DropdownItem
                  key="logout"
                  className="text-danger"
                  color="danger"
                  startContent={<MdOutlineLogout size={17} />}
                  onClick={handleLogout}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
      </div>
    </>
  );
}
