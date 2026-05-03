export interface Meeting {
  type: 'call' | 'video' | 'message';
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  createdAt: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
}
