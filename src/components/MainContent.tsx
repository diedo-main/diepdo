const MainContent = () => {
  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold text-memos-dark mb-6">Welcome to Memos</h1>
        <p className="text-lg text-gray-600 mb-8">
          Your personal space for notes, thoughts, and ideas. Start writing or explore your existing notes.
        </p>
        <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors">
          Create New Note
        </button>
      </div>
    </div>
  );
};

export default MainContent;