import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useInView } from "react-intersection-observer";
import { useNotes } from "@/hooks/useNotes";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import NoteCreationSection from "./NoteCreationSection";
import NoteList from "./NoteList";
import NoteSearch from "./NoteSearch";
import CalendarView from "./CalendarView";
import { useNoteSearch } from "@/hooks/useNoteSearch";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const MainContent = () => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  const { ref, inView } = useInView();
  const { session, loading: authLoading } = useAuth();
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; }[]>([]);
  const { notesQuery, createNote, updateNote, deleteNote } = useNotes();

  const allNotes = notesQuery.data?.pages.flatMap(page => page.notes) || [];
  const searchFilteredNotes = useNoteSearch(allNotes, searchQuery);
  
  // Filter notes by selected date
  const filteredNotes = searchFilteredNotes.filter(note => {
    if (!selectedDate) return true;
    
    const noteDate = toZonedTime(new Date(note.created_at), 'Asia/Ho_Chi_Minh');
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const noteDateStr = format(noteDate, 'yyyy-MM-dd');
    
    return selectedDateStr === noteDateStr;
  });

  useEffect(() => {
    const fetchTags = async () => {
      try {
        if (!session?.user) {
          console.log("No active session, skipping tag fetch");
          return;
        }

        console.log("Fetching tags for user:", session.user.id);
        const { data: tags, error } = await supabase
          .from("tags")
          .select("id, name")
          .eq('user_id', session.user.id);
        
        if (error) {
          console.error("Error fetching tags:", error);
          toast({
            title: "Error fetching tags",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        console.log("Tags fetched successfully:", tags);
        setAvailableTags(tags || []);
      } catch (error) {
        console.error("Unexpected error fetching tags:", error);
        toast({
          title: "Error fetching tags",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    };

    fetchTags();
  }, [session?.user, toast]);

  useEffect(() => {
    if (inView && notesQuery.hasNextPage && !notesQuery.isFetchingNextPage) {
      notesQuery.fetchNextPage();
    }
  }, [inView, notesQuery]);

  const handleSave = async (title: string, content: string, tags: { id: string; name: string; }[]) => {
    if (editingNoteId) {
      await updateNote.mutateAsync({
        id: editingNoteId,
        title,
        content,
        tags,
      });
      toast({ title: "Note updated successfully" });
    } else {
      await createNote.mutateAsync({
        title,
        content,
        tags,
      });
      toast({ title: "Note created successfully" });
    }
  };

  const handleEdit = (note: { id: string; title: string; content: string; tags: { id: string; name: string; }[] }) => {
    setEditingNoteId(note.id);
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteNote.mutateAsync(noteId);
      toast({ title: "Note deleted successfully" });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Failed to delete note",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = format(date, 'dd/MM/yyyy');
      toast({
        title: `Hiển thị ghi chú ngày ${formattedDate}`,
      });
    }
  };

  if (authLoading) {
    return <div className="p-4 text-center">Đang tải...</div>;
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto p-4 sm:p-6 md:p-8">
        <Auth 
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb',
                  brandAccent: '#1d4ed8',
                }
              }
            }
          }}
          theme="light"
          providers={[]}
          view="sign_in"
          localization={{
            variables: {
              sign_in: {
                email_label: "Email",
                password_label: "Mật khẩu",
                email_input_placeholder: "Địa chỉ email của bạn",
                password_input_placeholder: "Mật khẩu của bạn",
                button_label: "Đăng nhập",
                loading_button_label: "Đang đăng nhập ...",
                link_text: "Đã có tài khoản? Đăng nhập",
              },
              sign_up: {
                email_label: "Email",
                password_label: "Mật khẩu",
                email_input_placeholder: "Địa chỉ email của bạn",
                password_input_placeholder: "Mật khẩu của bạn",
                button_label: "Đăng ký",
                loading_button_label: "Đang đăng ký ...",
                link_text: "Chưa có tài khoản? Đăng ký",
              },
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Search bar for mobile */}
          <div className="lg:hidden col-span-1">
            <NoteSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Main content area */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <NoteCreationSection
              onSave={handleSave}
              editingNoteId={editingNoteId}
              onCancel={() => setEditingNoteId(null)}
            />

            {notesQuery.status === "error" ? (
              <div className="text-center text-red-500">
                Lỗi khi tải ghi chú: {notesQuery.error instanceof Error ? notesQuery.error.message : "Lỗi không xác định"}
              </div>
            ) : (
              <>
                <NoteList
                  notes={filteredNotes}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isLoading={notesQuery.status === "pending"}
                />
                <div ref={ref} className="h-8" />
                {notesQuery.isFetchingNextPage && (
                  <div className="text-center mt-4">Đang tải thêm ghi chú...</div>
                )}
              </>
            )}
          </div>

          {/* Sidebar with search and calendar - desktop only */}
          <div className="hidden lg:block lg:col-span-1 space-y-4">
            <NoteSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <CalendarView onDateSelect={handleDateSelect} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
