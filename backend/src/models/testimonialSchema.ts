// testimonialSchema.ts
import mongoose from 'mongoose';

export interface ITestimonial extends mongoose.Document {
  user_id: mongoose.Types.ObjectId;
  name: string;
  email_id: string;
  avatar: string;
  text: string;
  date: Date;
  approved: boolean;
}

const testimonialSchema = new mongoose.Schema<ITestimonial>({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Main_Collection',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email_id: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  approved: {
    type: Boolean,
    default: false,
  },
});

const Testimonial = mongoose.model<ITestimonial>('Testimonial', testimonialSchema);
export default Testimonial; 