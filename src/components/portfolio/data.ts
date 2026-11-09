// Missing destinations stay unavailable until authentic links/files are supplied.
export const links = {
  github: "https://github.com/ardianagoes",
  linkedin: undefined,
  email: "mailto:ardian_agoes@brown.edu",
  emailLabel: "ardian_agoes@brown.edu",
  resume: undefined,
};

export const interests = ["FPGA", "ASIC design", "Semiconductors", "Embedded systems", "Low-latency computing"];

export type ProjectDetails = {
  overview?: string;
  motivation?: string;
  contribution?: string;
  technologies?: string[];
  challenges?: string;
  media?: { src: string; alt: string; caption?: string }[];
  github?: string;
  demo?: string;
};

export type Project = { id: string; title: string; tagline: string; description: string; tags: string[]; kind: "sensor" | "app" | "calendar" | "sat" | "robot"; details?: ProjectDetails };

export const projects: Project[] = [
  { id: "01", title: "O2NYC", tagline: "Low-cost air-quality monitoring hardware", description: "Sensor hardware designed to make neighborhood-level air-quality measurement affordable and deployable.", tags: ["Embedded", "Sensors", "PCB"], kind: "sensor" },
  { id: "02", title: "Furney", tagline: "AI furniture discovery & 3D room planning", description: "An app that helps users discover furniture with AI and lay it out in a 3D model of their room.", tags: ["AI", "3D", "Web"], kind: "app" },
  { id: "03", title: "Deadline Desk", tagline: "Deadline tracker with AI screenshot extraction", description: "Imports calendars and extracts deadlines from screenshots using AI, keeping everything in one view.", tags: ["AI", "Calendar", "Full-stack"], kind: "calendar" },
  { id: "04", title: "CubeSat FlatSat", tagline: "Raspberry Pi + IMU triggered image capture", description: "A FlatSat test bench where IMU motion events trigger onboard camera capture on a Raspberry Pi.", tags: ["Raspberry Pi", "IMU", "Python"], kind: "sat" },
  { id: "05", title: "FIRST Robotics", tagline: "Programming, controls & hardware integration", description: "Robot programming, control systems tuning, and integrating electrical and mechanical subsystems.", tags: ["Controls", "Java", "Hardware"], kind: "robot" },
];

export const experience = [
  { org: "Brown Formula Racing", role: "Team Member", period: "Fall 2026–Present", note: "Working with the pedal box/throttle subteam." },
  { org: "Brown OIT", role: "IT Service Center Student Technician", period: "October 2026–Present", note: "Providing technical support." },
  { org: "Mypy Coding", role: "Senior Volunteer Tutor", period: "July 2024–Present", note: "Teaching programming to younger students." },
];

export const skills = [
  { group: "Hardware", confirmation: "pending", items: ["Circuit design", "PCB layout", "FPGA", "Microcontrollers", "Sensors"] },
  { group: "Programming", confirmation: "pending", items: ["Verilog / SystemVerilog", "C / C++", "Python", "Java", "TypeScript"] },
  { group: "Tools", confirmation: "pending", items: ["Vivado", "KiCad", "Git", "Linux", "Raspberry Pi"] },
  { group: "Engineering Areas", confirmation: "pending", items: ["Digital logic", "Embedded systems", "Control systems", "Signal processing", "Robotics"] },
];
