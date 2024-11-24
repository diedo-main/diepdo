import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";

const Index = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar className="w-64 hidden md:block" />
      <div className="flex-1 overflow-auto">
        <MainContent />
      </div>
    </div>
  );
};

export default Index;