import {notFound} from "next/navigation";
import Image from "next/image";
const BASE_URL=process.env.NEXT_PUBLIC_BASE_URL;
const Events=({icon,alt,label}:{icon:string ,alt:string,label:string})=>(
    <div className="flex gap-2">
        <Image src={icon} alt={alt} width={17} height={17}/>
        <p>{label}</p>
    </div>
);
const EventAgenda=({agendaItem}:{agendaItem:string[]})=>(
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItem.map((item)=>(
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
);
const EventTags=({tag}:{tag:string[]})=>(
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tag.map((item)=>(
            <div key={item} className="pill">{item}</div>
        ))}

    </div>
)
const EventDetails=async({params}:{params:Promise<{slug:string}>})=>{
    const {slug}=await params;
    const request=await fetch(`${BASE_URL}/api/events/${slug}`);
    const {event:{description,image,time,overview,date,tags,location,mode,agenda,audience,organizer}}=await request.json();
    if(!description) return notFound();
    return <section id="event">
        <div className="header">
            <h1>Event Description</h1>
            <p className="mt-2">{description}</p>
        </div>
        <div className="details">
            <div className="content">
                <Image src={image} alt={slug} width={800} height={800} className="banner"/>
                <section className="flex-col-gap-2">
                    <h2>Overview</h2>
                    <p>{overview}</p>
                </section>
                <section className="flex-col-gap-2">
                    <h2>Event Details</h2>
                    <Events icon="/icons/calendar.svg" alt="calendar" label={date}/>
                    <Events icon="/icons/clock.svg" alt="time" label={time}/>
                    <Events icon="/icons/pin.svg" alt="pin" label={location}/>
                    <Events icon="/icons/mode.svg" alt="mode" label={mode}/>
                    <Events icon="/icons/audience.svg" alt="audience" label={audience}/>

                </section>
                <EventAgenda agendaItem={JSON.parse(agenda[0])}/>
                <div className="flex-col gap-4">
                    <h2>About the Organizer</h2>
                    <p>{organizer}</p>
                </div>
                <EventTags tag={JSON.parse(tags[0])}/>
            </div>
            <aside className="booking">
                <p className="text-lg font-semibold">Book Event</p>
            </aside>
        </div>
    </section>
}
export default EventDetails;