import {
  BookOpenText,
  FirstAidKit,
  GenderFemale,
  HandHeart,
  BowlFood,
  Scales,
  Heart,
  ShieldCheck,
  UsersThree,
  Sparkle,
} from '@phosphor-icons/react'

// Contact details shown across the site
export const site = {
  name: 'Samarpita',
  fullName: 'Samarpita Social Foundation Trust',
  odia: 'ସମର୍ପିତ',
  tagline: 'Seva hi Samarpan',
  email: 'samarpitateam@gmail.com',
  phone: '+91 95834 63595',
  phoneRaw: '+919583463595',
  whatsapp: '+91 95834 63595',
  whatsappLink: 'https://wa.me/919583463595',
  // Every number people can call; the first one is the main helpline shown on buttons
  phones: [
    { label: 'Helpline', number: '+91 95834 63595', raw: '+919583463595' },
    { label: 'Team', number: '+91 82607 33288', raw: '+918260733288' },
    { label: 'Team', number: '+91 73260 59766', raw: '+917326059766' },
    { label: 'Team', number: '+91 77498 97726', raw: '+917749897726' },
  ],
  address: 'Odisha, India',
  hours: 'Mon to Sat, 9:00 AM to 7:00 PM',
  socials: {
    facebook: '#',
    instagram: 'https://www.instagram.com/samar.pita2005/',
    youtube: '#',
    x: '#',
    whatsapp: 'https://wa.me/919583463595',
  },
}

// Photos are served from ImageKit, which resizes and compresses them on the fly
const ik = (file, tr = 'w-1600') => `https://ik.imagekit.io/h7wep5nji/samarpita/${file}?tr=${tr},q-80,f-auto`
// Instagram reels shown on the site — add more reel links here
export const reels = [
  'https://www.instagram.com/reel/DJxr4qETjtV/',
  'https://www.instagram.com/reel/DfgV5IFKXqR/',
  'https://www.instagram.com/reel/Dfe7U8Lo4B-/',
  'https://www.instagram.com/reel/DfSOLwhRl96/',
  'https://www.instagram.com/reel/DfLq_CJyEjO/',
  'https://www.instagram.com/reel/DdGaVIjRz_e/',
  'https://www.instagram.com/reel/Da4veAehJBk/',
  'https://www.instagram.com/reel/DZ2EVRuI7Qr/',
  'https://www.instagram.com/reel/DZq9NRAxJcg/',
]

export const images = {
  team: ik('team-samarpita-group.jpg', 'w-2000'),
  teamSmall: ik('team-samarpita-group.jpg', 'w-1200'),
  founder: ik('founder.jpg', 'w-900'),
}

// Team members shown in the arc gallery on the About page.
// Upload each photo to ImageKit under samarpita/team/ and set it with ik('team/<file>.jpg', 'w-600').
// Leave photo as null until the picture is ready; the card then shows the member's initials.
export const team = [
  { name: 'Founder', role: 'Founder & President', photo: images.founder },
  { name: 'Team Member', role: 'Secretary', photo: null },
  { name: 'Team Member', role: 'Treasurer', photo: null },
  { name: 'Team Member', role: 'Blood Donation Lead', photo: null },
  { name: 'Team Member', role: 'Education Coordinator', photo: null },
  { name: 'Team Member', role: 'Health Camp Coordinator', photo: null },
  { name: 'Team Member', role: 'Volunteer', photo: null },
  { name: 'Team Member', role: 'Volunteer', photo: null },
]

export const nav = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Blood Donation', to: '/blood-donation' },
  { label: 'Support Us', to: '/support' },
  { label: 'Contact Us', to: '/contact' },
]

export const stats = [
  { value: 3000, suffix: '+', label: 'People helped' },
  { value: 50, suffix: '+', label: 'Active volunteers' },
  { value: 20, suffix: '+', label: 'Villages reached' },
  { value: 8, suffix: '', label: 'Years of seva' },
]

export const services = [
  { icon: BookOpenText, title: 'Education', text: 'Scholarships, study material and free tuition for children who cannot afford school.' },
  { icon: FirstAidKit, title: 'Healthcare', text: 'Health camps, medicine support and help navigating hospitals for treatment.' },
  { icon: GenderFemale, title: 'Women Empowerment', text: 'Skill training, safety support and counselling for women and young girls.' },
  { icon: HandHeart, title: 'Elderly Care', text: 'Companionship, pension guidance and daily-needs support for senior citizens.' },
  { icon: BowlFood, title: 'Food & Relief', text: 'Ration kits, community kitchens and fast response during floods and disasters.' },
  { icon: Scales, title: 'Legal & Social Guidance', text: 'Free guidance on documents, government schemes and legal rights.' },
]

export const steps = [
  { n: '01', title: 'Tell us your problem', text: 'Fill the contact form or call us. Every message reaches our team directly, in confidence.' },
  { n: '02', title: 'We review & reach out', text: 'A coordinator studies your case and contacts you within 24 to 48 hours.' },
  { n: '03', title: 'We solve it together', text: 'We connect you with volunteers, experts and resources until the problem is solved.' },
]

export const testimonials = [
  { quote: 'When nobody listened to us, Samarpita did. They stood by my family until my son got his treatment.', name: 'Sunita Devi', place: 'Cuttack' },
  { quote: 'I wrote one message on the website. Within a day someone called me and guided me step by step.', name: 'Prakash Nayak', place: 'Puri' },
  { quote: 'They don’t just help, they treat you with dignity. That is what makes them different.', name: 'Anjali Mishra', place: 'Bhubaneswar' },
]

export const values = [
  { icon: Heart, title: 'Compassion', text: 'We listen first, and help with empathy.' },
  { icon: ShieldCheck, title: 'Honesty', text: 'Complete transparency in every rupee and action.' },
  { icon: UsersThree, title: 'Equality', text: 'Help for every person, regardless of background.' },
  { icon: Sparkle, title: 'Dedication', text: 'We stay until the problem is truly solved.' },
]
