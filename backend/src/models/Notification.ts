import mongoose, { Document, Schema } from 'mongoose';

export enum NotificationType {
  DUE_DATE_REMINDER = 'due_date_reminder',
  OVERDUE = 'overdue',
  BOOK_AVAILABLE = 'book_available',
  RETURN_CONFIRMATION = 'return_confirmation',
  SYSTEM = 'system'
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  message: string;
  relatedBookId?: mongoose.Types.ObjectId;
  relatedBorrowingId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true
    },
    type: { 
      type: String, 
      enum: Object.values(NotificationType),
      required: true
    },
    message: { 
      type: String, 
      required: true 
    },
    relatedBookId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Book' 
    },
    relatedBorrowingId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Borrowing' 
    },
    isRead: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
