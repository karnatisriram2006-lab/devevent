import { Schema, model, models, Document } from 'mongoose';

export interface IEvent extends Document {
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: Date; // ✅ changed to Date
    time: string;
    mode: string;
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        overview: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        image: {
            type: String,
            required: true,
            trim: true,
        },
        venue: {
            type: String,
            required: true,
            trim: true,
        },
        location: {
            type: String,
            required: true,
            trim: true,
        },
        date: {
            type: Date, // ✅ Correct type
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        mode: {
            type: String,
            required: true,
            enum: ['online', 'offline', 'hybrid'],
        },
        audience: {
            type: String,
            required: true,
            trim: true,
        },
        agenda: {
            type: [String],
            validate: [(v: string[]) => v.length > 0, 'At least one agenda item required'],
        },
        organizer: {
            type: String,
            required: true,
            trim: true,
        },
        tags: {
            type: [String],
            validate: [(v: string[]) => v.length > 0, 'At least one tag required'],
        },
    },
    { timestamps: true }
);

// 🔥 Modern async middleware
EventSchema.pre('save', async function () {
    if (this.isModified('title') || this.isNew) {
        const baseSlug = generateSlug(this.title);
        let slug = baseSlug;
        let counter = 1;

        // Ensure unique slug
        while (await models.Event.exists({ slug })) {
            slug = `${baseSlug}-${counter++}`;
        }

        this.slug = slug;
    }

    if (this.isModified('time')) {
        this.time = normalizeTime(this.time);
    }
});

// Helper: Slug generator
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// Helper: Normalize time
function normalizeTime(timeString: string): string {
    const match = timeString.trim().match(/^(\d{1,2}):(\d{2})(\s*(AM|PM))?$/i);
    if (!match) throw new Error('Invalid time format');

    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[4]?.toUpperCase();

    if (period) {
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
    }

    if (hours > 23) throw new Error('Invalid hour value');

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

EventSchema.index({ slug: 1 }, { unique: true });
EventSchema.index({ date: 1, mode: 1 });

const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;