// types/Attachments.ts
export interface AttachmentDTO {
  id: number;
  type: string;
  command_id: number;
  keyboard?: KeyboardDTO | number | null; // ✅ Добавлено число
  inline_keyboard?: InlineKeyboardDTO | number | null; // ✅ Добавлено число
  audio?: number | null; // ✅ Добавлено число
  image?: number | null; // ✅ Добавлено число
  document?: number | null; // ✅ Добавлено число
  video?: number | null; // ✅ Добавлено число
  location?: number | null; // ✅ Добавлено число
  contact?: number | null; // ✅ Добавлено число
}


export  interface KeyboardDTO {
  id: number;
  keyboard_name: string;
  buttons: ButtonDTO[];
  one_time_keyboard: boolean;
  resize_keyboard: boolean;
  selective: boolean;
  auto_remove: boolean;
}

export interface ButtonDTO {
  id?: number | null;
  text: string;
  url?: string | null;
  callback_data?: string | null;
  switch_inline_query?: string | null;
  row: number;
  position: number;
  inline_keyboard_id?: number | null;
  keyboard_id?: number | null;
  request_contact?: boolean;
  request_location?: boolean;
}

export interface InlineKeyboardDTO {
  id: number;
  inline_keyboard_name: string;
  buttons: InlineButtonDTO[];
}

export interface InlineButtonDTO {
  id?: number | null;
  text: string;
  url: string | null;
  callback_data: string | null;
  switch_inline_query: string | null;
  row: number;
  position: number;
  inline_keyboard_id: number | null;
}




