import { Home, BookOpen, Search, UserCircle, Inbox, Archive, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: BookOpen, label: "Resources", path: "/resources" },
  { icon: Search, label: "Explore", path: "/explore" },
  { icon: UserCircle, label: "Profile", path: "/profile" },
  { icon: Inbox, label: "Inbox", path: "/inbox" },
  { icon: Archive, label: "Archived", path: "/archived" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Sidebar = ({ className }: { className?: string }) => {
  return (
    <div className={cn("h-screen bg-white border-r border-gray-200 p-4 flex flex-col", className)}>
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-primary rounded-lg"></div>
        <h1 className="text-xl font-bold text-memos-dark">Memos</h1>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <a
                href={item.path}
                className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-memos-light transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;