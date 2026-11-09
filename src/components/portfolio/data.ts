// Missing destinations stay unavailable until authentic links/files are supplied.
export const links = {
  github: "https://github.com/ardianagoes",
  linkedin: "https://www.linkedin.com/in/ardianagoes/",
  resume: undefined,
};

export const education = { university: "Brown University", degree: "Sc.B. in Electrical Engineering", graduation: "May 2030" };

export const interests = ["FPGA and digital design", "Computer architecture", "VLSI", "Semiconductors", "Low-latency hardware", "Robotics"];

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

export type Project = { id: string; title: string; tagline: string; description: string; tags: string[]; kind: "sensor" | "app" | "calendar" | "sat" | "robot" | "alarm"; period?: string; details?: ProjectDetails };

export const projects: Project[] = [
  { id: "01", title: "O2NYC", tagline: "Low-cost environmental monitoring hardware", description: "Designed and assembled 15+ NodeMCU-based air-quality monitors with BME280 environmental sensors and laser particulate sensors. Reduced per-unit hardware costs by over 80%, from approximately $240 to $30.", tags: ["NodeMCU", "BME280", "Laser particulate sensors"], kind: "sensor" },
  { id: "02", title: "Furney", tagline: "AI furniture discovery & 3D room planning", description: "An app that helps users discover furniture with AI and lay it out in a 3D model of their room.", tags: ["AI", "3D", "Web"], kind: "app" },
  { id: "03", title: "Deadline Desk", tagline: "Deadline tracker with AI screenshot extraction", description: "Imports calendars and extracts deadlines from screenshots using AI, keeping everything in one view.", tags: ["AI", "Calendar", "Full-stack"], kind: "calendar" },
  { id: "04", title: "CubeSat FlatSat", tagline: "Raspberry Pi + IMU triggered image capture", description: "Developed Python code to monitor three-axis IMU acceleration and trigger Raspberry Pi camera captures above a threshold. Used Adafruit sensor libraries and Picamera2 with a three-second capture delay.", tags: ["Python", "Raspberry Pi", "Adafruit", "Picamera2"], kind: "sat", period: "December 2024 – February 2025" },
  { id: "05", title: "FIRST Robotics", tagline: "Autonomous robotics software", description: "Programmed autonomous routines in Java using WPILib and PathPlanner, including PID control and trajectory following. Developed and debugged command-based subsystems integrating motor controllers and sensors.", tags: ["Java", "WPILib", "PathPlanner", "PID control"], kind: "robot" },
  { id: "06", title: "Snoozeless", tagline: "Wearable silent alarm prototype · ENGN 0030", description: "Built and debugged an ESP32-based prototype with a vibration motor, tactile buttons, and clasp-triggered inputs. Tested alarm activation and dismissal through serial monitoring and hardware debugging.", tags: ["ESP32", "Embedded systems", "Hardware debugging"], kind: "alarm", period: "October 2026 – November 2026" },
];

export const experience = [
  { org: "O2NYC", role: "Head of Technology", period: "January 2025 – Present", notes: ["Designed and assembled 15+ NodeMCU air-quality monitors with BME280 and laser particulate sensors.", "Reduced per-unit hardware costs by over 80%, from approximately $240 to $30.", "Develop and maintain the React website with GIS resources, sensor updates, and environmental advocacy information."] },
  { org: "Brown Formula Racing", role: "Pedal Box Team Member", period: "October 2026 – Present", notes: ["Designed and iterated a throttle-pedal model in SolidWorks, refining cutouts to address lateral flex and structural rigidity.", "Practiced manual lathe operation and foundational machining at the Brown Design Workshop."] },
  { org: "Brown University Office of Information Technology", role: "Student Technician", period: "October 2026 – Present", notes: ["Manage and track loaner laptops, cameras, projectors, and other audiovisual equipment.", "Reset, inspect, test, and troubleshoot Windows and macOS devices to prepare them for use."] },
  { org: "Stuyvesant FIRST Robotics Team 694 StuyPulse", role: "Software Engineer & FLL Mentor", period: "September 2023 – June 2026", notes: ["Programmed Java autonomous routines with WPILib and PathPlanner, including PID control and trajectory following.", "Developed and debugged command-based subsystems integrating motor controllers and sensors.", "Mentored a FIRST LEGO League team in programming, construction, and competition preparation."] },
  { org: "Stuyvesant Student Union", role: "Caucus IT Web Developer", period: "August 2024 – June 2026", notes: ["Developed and maintained Junior and Senior Caucus websites.", "Built and deployed features with React, HTML/CSS, and Git, supporting information access for over 800 students."] },
  { org: "Mypy Coding", role: "Senior Volunteer Tutor", period: "July 2024 – June 2025", notes: ["Taught Python fundamentals to students in grades 2–8."] },
];

export const skills = [
  { group: "Hardware", items: ["ESP32", "Arduino", "NodeMCU", "Sensor integration", "Soldering", "PC building"] },
  { group: "Programming", items: ["Java", "Python", "JavaScript"] },
  { group: "Software and Tools", items: ["Git", "SolidWorks", "WPILib", "PathPlanner", "React", "HTML/CSS"] },
];
