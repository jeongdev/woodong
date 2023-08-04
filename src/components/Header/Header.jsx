import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Dialog, Popover } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const navList = [
  {
    txt: "특수동물 병원 검색",
    path: "/",
  },
  {
    txt: "제보",
    path: "/report",
  },
];

export default function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <h1 className="flex lg:flex-1">
          <NavLink to="/" className="-m-1.5 p-1.5">
            <img
              className="h-8 w-auto"
              src="/images/logo.png"
              alt="woodong Logo"
              title="woodong"
            />
          </NavLink>
        </h1>
        <div className="flex md:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <Popover.Group className="hidden md:flex md:gap-x-12">
          {navList.map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              className={({ isActive }) =>
                (isActive && "text-primary") +
                " text-sm leading-6 text-gray-900 hover:font-bold"
              }
            >
              {item.txt}
            </NavLink>
          ))}
        </Popover.Group>
        {/* <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <a href="/" className="text-sm font-semibold leading-6 text-gray-900">
            Log in <span aria-hidden="true">&rarr;</span>
          </a>
        </div> */}
      </nav>
      <Dialog
        as="div"
        className="md:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <NavLink to="/" className="-m-1.5 p-1.5">
              <span className="sr-only">우리동네 동물병원</span>
            </NavLink>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              {navList.map((item, i) => (
                <div
                  key={`m-${i}`}
                  onClick={() =>
                    location.pathname !== item.path && setMobileMenuOpen(false)
                  }
                  className="space-y-2 py-6"
                >
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      (isActive && "text-primary") +
                      " -mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    }
                  >
                    {item.txt}
                  </NavLink>
                </div>
              ))}
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
