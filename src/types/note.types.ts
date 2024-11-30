export interface Tag {
  id: string;
  name: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  pinned: boolean;
  tags: Tag[];
}

export interface UpdateNoteInput {
  id: string;
  title: string;
  content: string;
  tags: Tag[];
}