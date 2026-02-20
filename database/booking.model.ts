import { Schema, model, models, Document, Types } from 'mongoose';
import mongoose from 'mongoose';

// TypeScript interface
export interface IBooking extends Document {
    eventId: Types.ObjectId;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: 'Event',
            required: [true, 'Event ID is required'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                'Please provide a valid email address',
            ],
        },
    },
    { timestamps: true }
);

// ✅ Modern async middleware (NO next())
BookingSchema.pre('save', async function () {
    if (!this.isModified('eventId')) return;

    const EventModel = mongoose.models.Event;
    if (!EventModel) {
        throw new Error('Event model not initialized');
    }

    const exists = await EventModel.exists({ _id: this.eventId });

    if (!exists) {
        throw new Error(`Event with ID ${this.eventId} does not exist`);
    }
});

// Indexes
BookingSchema.index({ eventId: 1, createdAt: -1 });
BookingSchema.index({ email: 1 });
BookingSchema.index(
    { eventId: 1, email: 1 },
    { unique: true, name: 'uniq_event_email' }
);

const Booking =
    models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;