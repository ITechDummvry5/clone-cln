const SITE = {
  name: "VISTAHAVEN", phone: "+1-800-555-1234", email: "info@vistahaven.com",
  address: "123 Serenity Boulevard, Los Angeles, CA 90012, United States",
  year: 2025, owner: "VistaHaven",
  url: "https://www.vistahaven.com",      // change to the real domain before launch
  hours: "Mon to Fri, 9am to 6pm PT",
  formEndpoint: ""                        // e.g. a Formspree/Getform URL. Empty = opens the visitor's email app instead
};
const NAV_LINKS = [
  { label: "Home",       href: "index.html#hero",            page: "home" },
  { label: "Services",   href: "index.html#feature-service", page: "" },
  { label: "Properties", href: "properties.html",            page: "properties" },
  { label: "About",      href: "about.html",                 page: "about" },
  { label: "Agents",     href: "agents.html",                page: "agents" },
  { label: "Contact",    href: "contact.html",               page: "contact", mobileOnly: true }
];
const AMENITIES = ["TV","Air Conditioner","Washing Machine","Internet","Water Heater","Refrigerator","Sofa","Wardrobe"];
const TYPE_LABEL = { Sell:"For Sell", Rent:"For Rent", Investment:"For Investment" };
const PROPERTIES = [
  { id:"billionaire-mansion", title:"Billionaire Mansion", loc:"Bel Air, LA", type:"Sell", beds:5, baths:4, sqft:3800, price:500000, lat:34.0836, lng:-118.4487, agent:"benjamin",
    overview:"A statement estate in Bel Air with a pool terrace, floor-to-ceiling glass and warm timber finishes across 3,800 sq.ft." },
  { id:"palazzo-di-amore", title:"Palazzo di Amore", loc:"Beverly Hills, CA", type:"Rent", beds:4, baths:2, sqft:2100, price:490000, lat:34.0736, lng:-118.4004, agent:"isabella",
    overview:"Welcome to Palazzo di Amore, a refined 4-bedroom modern residence in the heart of Beverly Hills. With 2,100 sq.ft of open living space, this home blends sleek architecture with natural materials, offering a tranquil escape just minutes from city life. Expansive windows, warm wood interiors, and thoughtful landscaping make this rental a rare gem of elegance and comfort." },
  { id:"the-one", title:"The One", loc:"Bel Air, LA", type:"Investment", beds:6, baths:4, sqft:2780, price:690000, lat:34.0900, lng:-118.4600, agent:"emily",
    overview:"A six-bedroom modern home set in mature gardens, a strong income property in one of LA's most requested neighborhoods." },
  { id:"the-beverly-house", title:"The Beverly House", loc:"Beverly Hills, CA", type:"Rent", beds:3, baths:2, sqft:1500, price:290000, lat:34.0696, lng:-118.4053, agent:"isabella",
    overview:"A compact, light-filled home with a reflecting pool and a clean concrete-and-timber facade, close to Rodeo Drive." },
  { id:"the-manor", title:"The Manor", loc:"Holmby Hills, LA", type:"Investment", beds:7, baths:5, sqft:3100, price:482000, lat:34.0757, lng:-118.4289, agent:"emily",
    overview:"A seven-bedroom cliffside-style residence with an infinity pool and long sunset views over Holmby Hills." },
  { id:"penthouse-century-city", title:"The Penthouse at Century City", loc:"Century City, LA", type:"Sell", beds:3, baths:2, sqft:2200, price:298000, lat:34.0558, lng:-118.4170, agent:"noah",
    overview:"A solar-equipped hillside home with forest views, designed to keep energy costs low without losing any comfort." }
];
const AGENTS = [
  { id:"isabella",  name:"Isabella Wright",  role:"Short-Term Rental Expert" },
  { id:"noah",      name:"Noah Clarke",      role:"Eco-Friendly Property Specialist" },
  { id:"benjamin",  name:"Benjamin Foster",  role:"Urban Development Advisor" },
  { id:"emily",     name:"Emily Chen",       role:"Investment Property Consultant" },
  { id:"michael",   name:"Michael Anderson", role:"Vacation Rental Specialist" },
  { id:"charlotte", name:"Charlotte Morgan", role:"High-End Property Consultant" },
  { id:"sophia",    name:"Sophia Rivera",    role:"Sustainable Housing Consultant" },
  { id:"liam",      name:"Liam Carter",      role:"Commercial Real Estate Agent" }
];
const SERVICES = [
  { title:"Luxury Residences", img:"svc_luxury", icon:"house", text:"Experience unparalleled elegance in our luxury residences, featuring exquisite design, premium amenities, and prime locations for the most discerning tastes." },
  { title:"Eco Green Buildings", img:"svc_eco", icon:"leaf", text:"Discover sustainable living in our eco-friendly properties, designed to minimize environmental impact while offering modern comforts and energy efficiency." },
  { title:"Unique Vacation Homes", img:"svc_vacation", icon:"tree", text:"Explore our curated collection of unique vacation homes, offering distinctive architecture and exceptional locations for unforgettable stays." }
];
const WHY = [
  ["Property Sales","Expertly promoting and selling your property to attract qualified buyers."],
  ["Buyer Representation","Guiding you through the luxury home buying process, prioritizing your needs."],
  ["Rental Management","Managing tenant relations, maintenance, and finances to maximize your returns."],
  ["Investment Consulting","Providing strategic advice to help you capitalize on real estate opportunities."],
  ["Property Valuation","Accurately assessing your property's value for sales, purchases or investments."],
  ["Tailored Solutions","Delivering customized real estate services aligned with your specific goals."]
];
const TESTIMONIALS = [
  ["Nathan Harper","Software Architect","Selling our family home felt stressful until the team stepped in. They handled everything and we closed above asking."],
  ["Logan Price","Entrepreneur","Made it all feel doable. Clear advice at every step and no pressure to move faster than we wanted."],
  ["Aria Sullivan","Digital Nomad","Isabella was amazing: super friendly and detail-oriented. I found the perfect rental without the usual hassle."],
  ["Grace Powell","Financial Analyst","I had no idea where to start with property investment, but Emily made it all make sense. Patient, honest and completely on my side."],
  ["Scarlett Mitchell","Interior Designer","I thought the whole process would be a nightmare, but it was simple. Everything was explained clearly and nothing was a surprise."],
  ["Samuel Brooks","Project Manager","Great communication, and they were looking out for me. I'd gladly work with this team again."]
];
const FAQS = [
  ["What is the process for buying a property?","You start with a consultation, shortlist homes, view them, make an offer, then complete inspections, financing and closing. Your agent guides each step."],
  ["How do I determine how much I can afford?","Review your income, debts and savings, get a mortgage pre-approval, and keep monthly costs under roughly 30% of your income."],
  ["What documents are required for renting a property?","Usually a valid ID, proof of income, recent bank statements, references and a completed rental application."],
  ["Can I terminate a lease agreement early?","Often yes, but it depends on your lease terms. Expect notice requirements and possibly a fee. Check your contract or ask your agent."],
  ["What are the risks of investing in real estate?","Market swings, vacancies, maintenance costs and interest rate changes. Good research and a diversified plan reduce them."],
  ["How do I choose the right property to invest in?","Compare location, rental demand, expected yield, growth potential and condition. We run the numbers with you."],
  ["Do high-end properties support virtual tours?","Yes. Most premium listings include video walkthroughs and live virtual tours on request."],
  ["How long does the property transfer process take?","Typically 30 to 60 days from accepted offer to closing, depending on financing and inspections."]
];
