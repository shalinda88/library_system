import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  isbn: string;
  genre: string;
  description: string;
  publishedDate: Date;
  coverImage: string;
  totalCopies: number;
  availableCopies: number;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema: Schema = new Schema(
  {
    title: { 
      type: String, 
      required: true, 
      index: true 
    },
    author: { 
      type: String, 
      required: true, 
      index: true 
    },
    isbn: { 
      type: String, 
      required: true, 
      unique: true 
    },
    genre: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    publishedDate: { 
      type: Date, 
      required: true 
    },
    coverImage: { 
      type: String, 
      default: 'default-book-cover.jpg' 
    },
    totalCopies: { 
      type: Number, 
      required: true, 
      min: 0, 
      default: 1 
    },
    availableCopies: { 
      type: Number, 
      required: true, 
      min: 0, 
      default: 1 
    },
    location: { 
      type: String, 
      required: true 
    },
  },
  { 
    timestamps: true,
    toJSON: { 
      virtuals: true 
    } 
  }
);

// Virtual for book availability status
BookSchema.virtual('status').get(function(this: IBook) {
  return this.availableCopies > 0 ? 'Available' : 'Unavailable';
});

// Search index for book title and author
BookSchema.index({ title: 'text', author: 'text', genre: 'text', description: 'text' });

export default mongoose.model<IBook>('Book', BookSchema);
