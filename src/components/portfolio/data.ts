// TODO: replace placeholder URLs with real profiles.
export const links = {
  github: "https://github.com/",
  linkedin: "https://www.linkedin.com/",
  email: "mailto:ardian_agoes@brown.edu",
  emailLabel: "ardian_agoes@brown.edu",
  resume: "#",
};

export const interests = ["FPGA", "ASIC design", "Semiconductors", "Embedded systems", "Low-latency computing"];

export type Project = { id: string; title: string; tagline: string; description: string; tags: string[]; kind: "sensor" | "app" | "calendar" | "sat" | "robot" };

export const projects: Project[] = [
  { id: "01", title: "O2NYC", tagline: "Low-cost air-quality monitoring hardware", description: "Sensor hardware designed to make neighborhood-level air-quality measurement affordable and deployable.", tags: ["Embedded", "Sensors", "PCB"], kind: "sensor" },
  { id: "02", title: "Furney", tagline: "AI furniture discovery & 3D room planning", description: "An app that helps users discover furniture with AI and lay it out in a 3D model of their room.", tags: ["AI", "3D", "Web"], kind: "app" },
  { id: "03", title: "Deadline Desk", tagline: "Deadline tracker with AI screenshot extraction", description: "Imports calendars and extracts deadlines from screenshots using AI, keeping everything in one view.", tags: ["AI", "Calendar", "Full-stack"], kind: "calendar" },
  { id: "04", title: "CubeSat FlatSat", tagline: "Raspberry Pi + IMU triggered image capture", description: "A FlatSat test bench where IMU motion events trigger onboard camera capture on a Raspberry Pi.", tags: ["Raspberry Pi", "IMU", "Python"], kind: "sat" },
  { id: "05", title: "FIRST Robotics", tagline: "Programming, controls & hardware integration", description: "Robot programming, control systems tuning, and integrating electrical and mechanical subsystems.", tags: ["Controls", "Java", "Hardware"], kind: "robot" },
];

export const experience = [
  { org: "Brown Formula Racing", role: "Team Member", period: "Dates TBD", note: "Role and subsystem details to be added." },
  { org: "Brown OIT", role: "Student Technician", period: "Dates TBD", note: "Responsibilities to be added." },
  { org: "Mypy Coding", role: "Senior Volunteer Tutor", period: "Dates TBD", note: "Teaching programming fundamentals. Details to be added." },
  { org: "Research & Interests", role: "Ongoing", period: "—", note: "Digital design, FPGA prototyping, and low-latency systems. Details to be added." },
];

export const skills = [
  { group: "Hardware", items: ["Circuit design", "PCB layout", "FPGA", "Microcontrollers", "Sensors"] },
  { group: "Programming", items: ["Verilog / SystemVerilog", "C / C++", "Python", "Java", "TypeScript"] },
  { group: "Tools", items: ["Vivado", "KiCad", "Git", "Linux", "Raspberry Pi"] },
  { group: "Engineering Areas", items: ["Digital logic", "Embedded systems", "Control systems", "Signal processing", "Robotics"] },
];
