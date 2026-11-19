
import { Bell, Search, Menu, ChevronRight, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Topbar({ onMenuClick, pageTitle = "Dashboard" }) {
  const navigate = useNavigate();

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("kaamflow_user") || "{}");
  } catch {
    user = {};
  }

  const userName = user.name || "Admin";
  const userRole = user.role || "Administrator";

  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("kaamflow_token");
    localStorage.removeItem("kaamflow_user");
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-100 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={21} />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="hidden text-slate-400 sm:block">Workspace</span>
          <ChevronRight size={14} className="hidden text-slate-300 sm:block" />
          <span className="font-bold text-slate-800">{pageTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-5">
        <div className="hidden h-10 w-64 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 md:flex">
          <Search size={17} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
          />
          <kbd className="rounded border border-slate-200 bg-white px-1.5 py-1 text-[9px] text-slate-400">
            ⌘ K
          </kbd>
        </div>

        <button
          className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-violet-50 hover:text-violet-600"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
        </button>

        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-violet-100 text-xs font-extrabold text-violet-700">
            {initials || "AD"}
          </div>

          <div className="hidden sm:block">
            <p className="text-xs font-bold text-slate-700">{userName}</p>
            <p className="text-[10px] text-slate-400">{userRole}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
          className="flex h-10 items-center gap-2 rounded-xl border border-rose-100 px-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
        >
          <LogOut size={17} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
