export interface Message {
  id: string;
  content: string;
  sender_id: string;
  room_Id: string;
  createdAt: string;
  type: string;
  sender: { name: string };
}

export interface MessagesProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  userId: string;
}

export interface ChatFormProps {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}
