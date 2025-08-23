import mongoose, { Document, Schema } from 'mongoose';

export enum BorrowingStatus {
  BORROWED = 'borrowed',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost'
}

export interface IBorrowing extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: BorrowingStatus;
  fine?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BorrowingSchema: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true
    },
    bookId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Book', 
      required: true,
      index: true 
    },
    borrowDate: { 
      type: Date, 
      required: true, 
      default: Date.now 
    },
    dueDate: { 
      type: Date, 
      required: true 
    },
    returnDate: { 
      type: Date 
    },
    status: { 
      type: String, 
      enum: Object.values(BorrowingStatus),
      default: BorrowingStatus.BORROWED,
      index: true
    },
    fine: { 
      type: Number, 
      default: 0 
    },
    notes: { 
      type: String 
    }
  },
  { timestamps: true }
);

// Compound index to quickly find active borrowings by user
BorrowingSchema.index({ userId: 1, status: 1 });

export default mongoose.model<IBorrowing>('Borrowing', BorrowingSchema);
