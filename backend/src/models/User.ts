import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  USER = 'user',
  LIBRARIAN = 'librarian',
  ADMIN = 'admin'
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  profilePicture?: string;
  membershipId: string;
  borrowingLimit: number;
  borrowedBooks: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      enum: Object.values(UserRole),
      default: UserRole.USER 
    },
    profilePicture: { 
      type: String,
      default: 'default-avatar.png' 
    },
    membershipId: { 
      type: String, 
      required: true, 
      unique: true 
    },
    borrowingLimit: { 
      type: Number, 
      default: 5 
    },
    borrowedBooks: { 
      type: Number, 
      default: 0 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: (_, ret: Record<string, any>) => {
        // Check if password exists before deleting it
        if ('password' in ret) {
          delete ret.password;
        }
        return ret;
      },
      virtuals: true
    }
  }
);

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    // Explicitly cast password to string
    const passwordStr = String(this.password);
    this.password = await bcrypt.hash(passwordStr, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to check password validity
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Virtual for user's borrowing status
UserSchema.virtual('canBorrow').get(function(this: IUser) {
  return this.borrowedBooks < this.borrowingLimit;
});

export default mongoose.model<IUser>('User', UserSchema);
