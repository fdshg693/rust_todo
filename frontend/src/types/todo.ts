export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
}

export interface TodoInput {
  title: string;
  description?: string;
}

export interface TodoUpdate {
  completed: boolean;
}

export interface TodoUpdateInput {
  title?: string;
  description?: string;
  completed?: boolean;
}
