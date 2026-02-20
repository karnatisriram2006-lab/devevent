// import {NextRequest, NextResponse} from "next/server";
// import connectDB from "@/lib/mongodb";
// import Event from '@/database/event.model';
// import {v2 as cloudinary} from "cloudinary";
// import {resolve} from "node:dns";
// export async function POST(req: NextRequest, res: NextResponse){
//     try{
//         await connectDB();
//         const formData=await req.formData();
//         const file=formData.get('image') as File;
//         let event;
//         try{
//             event=Object.fromEntries(formData.entries());
//         }catch(err){
//             return NextResponse.json({message:'Invalid JSON data format'},{status:400});
//         }
//
//         if(!file){
//             return NextResponse.json({message:'Image file is required'},{status:400})
//         }
//         const bytes=await file.arrayBuffer();
//         const buffer=Buffer.from(bytes);
//         const uploadResult=await new Promise((resolve,reject)=>{
//             cloudinary.uploader.upload_stream({resource_type:'image',folder:'DevEvent'},(error,result)=>{
//                 if(error) return reject(error);
//                 resolve(result);
//             }).end(buffer)
//         })
//         event.image=(uploadResult as {secure_url:string}).secure_url;
//         const createdEvent=await Event.create(event);
//         return NextResponse.json({message:'Event created',event:createdEvent},{status:201});
//     }catch(err){
//         console.error(err);
//         return NextResponse.json({message:'Event Creation Failed',errors:err instanceof Error?err.message:'Unknown'},{status:400});
//     }
// }
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();

        // ✅ Extract file FIRST
        const file = formData.get("image");

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { message: "Valid image file is required" },
                { status: 400 }
            );
        }

        // ✅ Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // ✅ Upload to Cloudinary
        const uploadResult: any = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    { resource_type: "image", folder: "DevEvent" },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                )
                .end(buffer);
        });

        // ✅ Build event object manually (DO NOT use Object.fromEntries directly)
        const eventData = {
            title: formData.get("title"),
            description: formData.get("description"),
            overview: formData.get("overview"),
            venue: formData.get("venue"),
            location: formData.get("location"),
            date: formData.get("date"),
            time: formData.get("time"),
            mode: formData.get("mode"),
            audience: formData.get("audience"),
            organizer: formData.get("organizer"),

            // 🔥 THIS IS THE IMPORTANT PART
            agenda: formData.getAll("agenda"),
            tags: formData.getAll("tags"),

            image: uploadResult.secure_url,
        };

        const createdEvent = await Event.create(eventData);

        return NextResponse.json(
            { message: "Event created", event: createdEvent },
            { status: 201 }
        );
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            {
                message: "Event Creation Failed",
                errors: err instanceof Error ? err.message : "Unknown",
            },
            { status: 400 }
        );
    }
}
export async function GET(){
    try{
        await connectDB();
        const events = await Event.find().sort({createdAt: -1});
        return NextResponse.json({message: "Event list successfully", events},{status:200});
    }catch(err){
        return NextResponse.json({message: "Event Not Found",error: err},{status:500});
    }
}