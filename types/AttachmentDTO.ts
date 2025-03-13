interface AttachmentDTO {
  id: number;
  type: string;
  command_id: number;
  inline_keyboard?: InlineKeyboardDTO;
  keyboard?: KeyboardDTO;
}


interface KeyboardDTO {
  id: number;
  keyboard_name: string;
  buttons: ButtonDTO[];
  one_time_keyboard: boolean;
  resize_keyboard: boolean;
  selective: boolean;
  auto_remove: boolean;
}

interface ButtonDTO {
  id?: number;
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

interface InlineKeyboardDTO {
  id: number;
  inline_keyboard_name: string;
  buttons: InlineButtonDTO[];
}

interface InlineButtonDTO {
  text: string;
  url: string | null;
  callback_data: string | null;
  switch_inline_query: string | null;
  row: number;
  position: number;
  inline_keyboard_id: number | null;
}




